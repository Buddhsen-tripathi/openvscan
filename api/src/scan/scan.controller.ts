import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ScanService } from './scan.service';
import { ScanRequestDto } from './dto/scan-request.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('scan')
@ApiTags('scan (Vulnerability scanning endpoints)')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Initiate a vulnerability scan',
    description:
      'Starts a vulnerability scan for a given target (URL, IP, or repository).The scan can use different open-source scanners or AI-assisted analysis depending on the configuration.',
  })
  async scan(@Body() scanRequest: ScanRequestDto) {
    return this.scanService.scan(scanRequest);
  }
}
