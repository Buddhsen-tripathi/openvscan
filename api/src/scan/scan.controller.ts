import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ScanService } from './scan.service';
import { ScanRequestDto } from './dto/scan-request.dto';

@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async scan(@Body() scanRequest: ScanRequestDto) {
    return this.scanService.scan(scanRequest);
  }
}
