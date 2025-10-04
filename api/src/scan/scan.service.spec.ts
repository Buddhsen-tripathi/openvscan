import { Test, TestingModule } from '@nestjs/testing';
import { ScanService } from './scan.service';
import { ScanType } from './dto/scan-request.dto';

describe('ScanService', () => {
  let service: ScanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScanService],
    }).compile();

    service = module.get<ScanService>(ScanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scan', () => {
    it('should return scan result for npm package', async () => {
      const scanRequest = {
        type: ScanType.NPM,
        target: 'lodash',
        version: '4.17.0',
      };

      const result = await service.scan(scanRequest);

      expect(result).toHaveProperty('scanId');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('vulnerabilities');
      expect(result).toHaveProperty('summary');
      expect(result.target).toBe('lodash');
      expect(result.summary.total).toBe(result.vulnerabilities.length);
    });

    it('should return empty vulnerabilities for safe packages', async () => {
      const scanRequest = {
        type: ScanType.NPM,
        target: 'safe-package',
        version: '1.0.0',
      };

      const result = await service.scan(scanRequest);

      expect(result.vulnerabilities).toHaveLength(0);
      expect(result.summary.total).toBe(0);
      expect(result.summary.critical).toBe(0);
      expect(result.summary.high).toBe(0);
      expect(result.summary.medium).toBe(0);
      expect(result.summary.low).toBe(0);
    });

    it('should scan package.json content', async () => {
      const packageJson = JSON.stringify({
        dependencies: {
          lodash: '^4.17.0',
          express: '^4.18.0',
        },
        devDependencies: {
          jest: '^29.0.0',
        },
      });

      const scanRequest = {
        type: ScanType.PACKAGE_JSON,
        target: packageJson,
      };

      const result = await service.scan(scanRequest);

      expect(result).toHaveProperty('scanId');
      expect(result).toHaveProperty('vulnerabilities');
      expect(result.summary.total).toBe(result.vulnerabilities.length);
    });

    it('should throw error for invalid package.json', async () => {
      const scanRequest = {
        type: ScanType.PACKAGE_JSON,
        target: 'invalid json',
      };

      await expect(service.scan(scanRequest)).rejects.toThrow();
    });

    it('should calculate summary correctly', async () => {
      const scanRequest = {
        type: ScanType.NPM,
        target: 'vulnerable-package',
        version: '1.0.0',
      };

      const result = await service.scan(scanRequest);

      expect(result.summary.total).toBe(
        result.summary.critical +
          result.summary.high +
          result.summary.medium +
          result.summary.low,
      );
    });
  });
});
