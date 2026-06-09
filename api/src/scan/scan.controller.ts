import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, UseGuards, Request, Query } from '@nestjs/common';
import { ScanService } from './scan.service';
import { ScanRequestDto } from './dto/scan-request.dto';
import { ApiOperation, ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { AuthGuard } from '../common';
import { Throttle } from '@nestjs/throttler';

@Controller('scan')
@ApiTags('scan (Vulnerability scanning endpoints)')
@UseGuards(AuthGuard)
@ApiCookieAuth('session')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({
    summary: 'Initiate a vulnerability scan',
    description:
      'Starts a vulnerability scan for a given target (URL, IP, or repository).The scan can use different open-source scanners or AI-assisted analysis depending on the configuration.',
  })
  async scan(@Body() scanRequest: ScanRequestDto, @Request() req) {
    return this.scanService.scan(scanRequest, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'List all scans',
    description: 'Lists all scans across the user\'s projects.',
  })
  async listScans(@Request() req) {
    return this.scanService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get scan details',
    description: 'Retrieves scan details including status, findings, and execution logs.',
  })
  async getScan(@Param('id') id: string, @Request() req) {
    return this.scanService.findOne(id, req.user.id);
  }

  @Get(':id/export')
  @ApiOperation({
    summary: 'Export scan findings',
    description: 'Exports scan findings in JSON or SARIF format.',
  })
  async exportScan(
    @Param('id') id: string,
    @Query('format') format: 'json' | 'sarif' = 'json',
    @Request() req,
  ) {
    return this.scanService.exportFindings(id, req.user.id, format);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a running scan',
    description: 'Cancels a scan that is currently pending or running.',
  })
  async cancelScan(@Param('id') id: string, @Request() req) {
    return this.scanService.cancel(id, req.user.id);
  }
}
