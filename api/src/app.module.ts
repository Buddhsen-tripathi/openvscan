import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScanModule } from './scan/scan.module';

@Module({
  imports: [ScanModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
