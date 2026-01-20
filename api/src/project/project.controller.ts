import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

// Mock Auth Guard for now - In real app, use actual AuthGuard
// We'll assume the user ID is passed in headers or we'll use a hardcoded one for dev if no auth
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Simulate authenticated user
    // In production, this comes from the session/token
    request.user = { id: 'user_default' }; 
    // Ideally we should actually check the session via better-auth or shared DB
    // But for this phase, let's keep it simple or assume the frontend sends a header
    return true;
  }
}

@Controller('projects')
@ApiTags('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  // @UseGuards(MockAuthGuard) // Enable when auth is ready
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    // For MVP/Dev, we might need a way to get the user ID. 
    // Since we are using better-auth, the session is HTTP-only cookie.
    // The API needs to validate the session.
    // For now, let's accept a userId in the body or header for testing, 
    // or fetch a default user if we want to test without full auth flow.
    // Let's assume we pass a header 'x-user-id' for testing purposes if not authenticated.
    
    const userId = req.headers['x-user-id'] || 'user_default'; 
    // TODO: Integrate proper Better-Auth session validation
    
    return this.projectService.create(userId, createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects for the current user' })
  async findAll(@Request() req) {
    const userId = req.headers['x-user-id'] || 'user_default';
    return this.projectService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  async findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  async remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
