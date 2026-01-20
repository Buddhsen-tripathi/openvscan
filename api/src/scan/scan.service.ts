import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DATABASE_PROVIDER } from '../database/drizzle.provider';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '@openvscan/db';
import { ScanRequestDto } from './dto/scan-request.dto';
import { ScanStatus } from '@openvscan/types';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ScanService {
  constructor(
    @Inject(DATABASE_PROVIDER)
    private readonly db: NeonHttpDatabase<typeof schema>,
    @InjectQueue('scan-queue') private readonly scanQueue: Queue,
  ) {}

  async scan(scanRequest: ScanRequestDto) {
    // For now, we require a project ID. In the future, we can infer it or create a default one.
    if (!scanRequest.projectId) {
      throw new BadRequestException('Project ID is required to start a scan');
    }

    // Verify project exists
    const project = await this.db.query.project.findFirst({
      where: eq(schema.project.id, scanRequest.projectId),
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

  async findOne(id: string) {
    const scan = await this.db.query.scan.findFirst({
      where: eq(schema.scan.id, id),
      with: {
        findings: true,
        logs: {
          orderBy: (logs, { asc }) => [asc(logs.timestamp)],
        },
      },
    });

    if (!scan) {
      throw new NotFoundException(`Scan with ID ${id} not found`);
    }

    return scan;
  }
}
