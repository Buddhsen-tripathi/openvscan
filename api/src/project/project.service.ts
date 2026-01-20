import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_PROVIDER } from '../database/drizzle.provider';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '@openvscan/db';
import { CreateProjectDto } from './dto/create-project.dto';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProjectService {
  constructor(
    @Inject(DATABASE_PROVIDER)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  async create(userId: string, createProjectDto: CreateProjectDto) {
    const projectId = uuidv4();
    const timestamp = new Date();

    await this.db.insert(schema.project).values({
      id: projectId,
      name: createProjectDto.name,
      description: createProjectDto.description,
      userId: userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return this.findOne(projectId);
  }

  async findAll(userId: string) {
    return this.db.query.project.findMany({
      where: eq(schema.project.userId, userId),
      orderBy: [desc(schema.project.updatedAt)],
      with: {
        scans: {
          orderBy: [desc(schema.scan.createdAt)],
          limit: 5,
        },
      },
    });
  }

  async findOne(id: string) {
    const project = await this.db.query.project.findFirst({
      where: eq(schema.project.id, id),
      with: {
        scans: {
          orderBy: [desc(schema.scan.createdAt)],
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async remove(id: string) {
    const result = await this.db
      .delete(schema.project)
      .where(eq(schema.project.id, id))
      .returning();

    if (result.length === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return { message: 'Project deleted successfully' };
  }
}
