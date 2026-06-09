import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DATABASE_PROVIDER } from '../database/drizzle.provider';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '@openvscan/db';
import { ScanRequestDto } from './dto/scan-request.dto';
import { ScanStatus } from '@openvscan/types';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ScanService {
  constructor(
    @Inject(DATABASE_PROVIDER)
    private readonly db: NeonHttpDatabase<typeof schema>,
    @InjectQueue('scan-queue') private readonly scanQueue: Queue,
  ) {}

  async scan(scanRequest: ScanRequestDto, userId: string) {
    // Verify project exists and belongs to user
    const project = await this.db.query.project.findFirst({
      where: and(
        eq(schema.project.id, scanRequest.projectId),
        eq(schema.project.userId, userId),
      ),
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${scanRequest.projectId} not found`);
    }

    const scanId = uuidv4();
    const timestamp = new Date();

    // Create scan record
    await this.db.insert(schema.scan).values({
      id: scanId,
      projectId: scanRequest.projectId,
      status: ScanStatus.PENDING,
      config: {
        target: scanRequest.target,
        scanners: scanRequest.scanners,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Dispatch job to worker
    await this.scanQueue.add('scan', {
      scanId,
      config: {
        target: scanRequest.target,
        scanners: scanRequest.scanners,
      },
    });

    return {
      scanId,
      status: ScanStatus.PENDING,
      target: scanRequest.target,
      timestamp: timestamp.toISOString(),
      message: 'Scan started successfully',
    };
  }

  async findAll(userId: string) {
    // First get all project IDs belonging to the user
    const userProjects = await this.db.query.project.findMany({
      where: eq(schema.project.userId, userId),
      columns: { id: true },
    });

    if (userProjects.length === 0) return [];

    const projectIds = userProjects.map(p => p.id);

    return this.db.query.scan.findMany({
      where: inArray(schema.scan.projectId, projectIds),
      with: {
        project: { columns: { id: true, name: true } },
      },
      orderBy: [desc(schema.scan.createdAt)],
    });
  }

  async findOne(id: string, userId: string) {
    const scan = await this.db.query.scan.findFirst({
      where: eq(schema.scan.id, id),
      with: {
        project: true,
        findings: true,
        logs: {
          orderBy: (logs, { asc }) => [asc(logs.timestamp)],
        },
      },
    });

    if (!scan) {
      throw new NotFoundException(`Scan with ID ${id} not found`);
    }

    // Verify the scan belongs to the user's project
    if (scan.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return scan;
  }

  async cancel(id: string, userId: string) {
    const scan = await this.db.query.scan.findFirst({
      where: eq(schema.scan.id, id),
      with: { project: true },
    });

    if (!scan) {
      throw new NotFoundException(`Scan with ID ${id} not found`);
    }

    if (scan.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (scan.status !== ScanStatus.PENDING && scan.status !== ScanStatus.RUNNING) {
      throw new BadRequestException(`Cannot cancel scan with status: ${scan.status}`);
    }

    // Remove from queue if still pending
    const jobs = await this.scanQueue.getJobs(['waiting', 'delayed']);
    for (const job of jobs) {
      if (job.data?.scanId === id) {
        await job.remove();
      }
    }

    // Update status in DB
    await this.db.update(schema.scan)
      .set({
        status: ScanStatus.CANCELLED,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.scan.id, id));

    return { message: 'Scan cancelled successfully', status: ScanStatus.CANCELLED };
  }

  async exportFindings(id: string, userId: string, format: 'json' | 'sarif') {
    const scan = await this.findOne(id, userId);

    if (format === 'sarif') {
      return this.toSarif(scan);
    }

    return {
      scan: {
        id: scan.id,
        status: scan.status,
        target: scan.config,
        startedAt: scan.startedAt,
        completedAt: scan.completedAt,
      },
      findings: scan.findings,
      exportedAt: new Date().toISOString(),
    };
  }

  private toSarif(scan: any) {
    return {
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/main/sarif-2.1/schema/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'OpenVScan',
              version: '1.0.0',
              informationUri: 'https://github.com/Buddhsen-tripathi/openvscan',
              rules: scan.findings.map((f: any) => ({
                id: f.id,
                shortDescription: { text: f.title },
                fullDescription: { text: f.description },
                defaultConfiguration: {
                  level: f.severity === 'critical' || f.severity === 'high' ? 'error' : f.severity === 'medium' ? 'warning' : 'note',
                },
              })),
            },
          },
          results: scan.findings.map((f: any) => ({
            ruleId: f.id,
            level: f.severity === 'critical' || f.severity === 'high' ? 'error' : f.severity === 'medium' ? 'warning' : 'note',
            message: { text: f.description },
            locations: f.location
              ? [
                  {
                    physicalLocation: {
                      artifactLocation: { uri: f.location },
                    },
                  },
                ]
              : [],
            fixes: f.remediation
              ? [{ description: { text: f.remediation } }]
              : [],
          })),
        },
      ],
    };
  }
}
