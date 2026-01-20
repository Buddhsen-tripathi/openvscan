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
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common';

@Controller('projects')
@ApiTags('projects')
@UseGuards(AuthGuard)
@ApiCookieAuth('session')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    const userId = req.user.id;
    return this.projectService.create(userId, createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects for the current user' })
  async findAll(@Request() req) {
    const userId = req.user.id;
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
