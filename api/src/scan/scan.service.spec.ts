import { Test, TestingModule } from '@nestjs/testing';
import { ScanService } from './scan.service';
import { DATABASE_PROVIDER } from '../database/drizzle.provider';
import { getQueueToken } from '@nestjs/bullmq';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ScanStatus, ScanType } from '@openvscan/types';

const mockProject = {
  id: 'project-1',
  name: 'Test Project',
  userId: 'user-1',
};

const mockScan = {
  id: 'scan-1',
  projectId: 'project-1',
  status: ScanStatus.COMPLETED,
  config: { target: 'nginx:latest', scanners: [ScanType.CONTAINER] },
  startedAt: new Date(),
  completedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  project: mockProject,
  findings: [
    { id: 'f1', scanId: 'scan-1', title: 'CVE-2024-001', description: 'Test vuln', severity: 'high', location: 'lib.so', remediation: 'Upgrade', tool: 'trivy', createdAt: new Date() },
  ],
  logs: [
    { id: 'l1', scanId: 'scan-1', level: 'info', message: 'Running Trivy scan', timestamp: new Date() },
  ],
};

const mockDb = {
  query: {
    project: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    scan: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
  insert: jest.fn().mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) }),
  update: jest.fn().mockReturnValue({ set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }) }),
  delete: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([]) }) }),
};

const mockQueue = {
  add: jest.fn().mockResolvedValue({}),
  getJobs: jest.fn().mockResolvedValue([]),
};

describe('ScanService', () => {
  let service: ScanService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScanService,
        { provide: DATABASE_PROVIDER, useValue: mockDb },
        { provide: getQueueToken('scan-queue'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<ScanService>(ScanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scan', () => {
    it('should create a scan and dispatch to queue', async () => {
      mockDb.query.project.findFirst.mockResolvedValue(mockProject);

      const result = await service.scan(
        { target: 'nginx:latest', scanners: [ScanType.CONTAINER], projectId: 'project-1' },
        'user-1',
      );

      expect(result).toHaveProperty('scanId');
      expect(result.status).toBe(ScanStatus.PENDING);
      expect(result.target).toBe('nginx:latest');
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalledWith('scan', expect.objectContaining({
        config: expect.objectContaining({ target: 'nginx:latest' }),
      }));
    });

    it('should throw NotFoundException if project not found', async () => {
      mockDb.query.project.findFirst.mockResolvedValue(null);

      await expect(
        service.scan(
          { target: 'nginx:latest', scanners: [ScanType.CONTAINER], projectId: 'bad-id' },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return scan with findings and logs', async () => {
      mockDb.query.scan.findFirst.mockResolvedValue(mockScan);

      const result = await service.findOne('scan-1', 'user-1');

      expect(result.id).toBe('scan-1');
      expect(result.findings).toHaveLength(1);
      expect(result.logs).toHaveLength(1);
    });

    it('should throw NotFoundException if scan not found', async () => {
      mockDb.query.scan.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad-id', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if scan belongs to another user', async () => {
      mockDb.query.scan.findFirst.mockResolvedValue(mockScan);

      await expect(service.findOne('scan-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancel', () => {
    it('should cancel a pending scan', async () => {
      const pendingScan = { ...mockScan, status: ScanStatus.PENDING };
      mockDb.query.scan.findFirst.mockResolvedValue(pendingScan);

      const result = await service.cancel('scan-1', 'user-1');

      expect(result.status).toBe(ScanStatus.CANCELLED);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException for completed scan', async () => {
      mockDb.query.scan.findFirst.mockResolvedValue(mockScan); // status: COMPLETED

      await expect(service.cancel('scan-1', 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('exportFindings', () => {
    it('should export as JSON', async () => {
      mockDb.query.scan.findFirst.mockResolvedValue(mockScan);

      const result = await service.exportFindings('scan-1', 'user-1', 'json');

      expect(result).toHaveProperty('scan');
      expect(result).toHaveProperty('findings');
      expect(result).toHaveProperty('exportedAt');
    });

    it('should export as SARIF', async () => {
      mockDb.query.scan.findFirst.mockResolvedValue(mockScan);

      const result = await service.exportFindings('scan-1', 'user-1', 'sarif') as any;

      expect(result).toHaveProperty('$schema');
      expect(result).toHaveProperty('version', '2.1.0');
      expect(result).toHaveProperty('runs');
      expect(result.runs[0].tool.driver.name).toBe('OpenVScan');
      expect(result.runs[0].results).toHaveLength(1);
    });
  });
});
