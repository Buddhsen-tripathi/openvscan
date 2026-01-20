import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScanType } from '@openvscan/types';

export class ScanRequestDto {
  @ApiProperty({
    enum: ScanType,
    isArray: true,
    description: 'Specifies the types of scans to perform.',
    example: [ScanType.STATIC_ANALYSIS],
  })
  @IsArray()
  @IsEnum(ScanType, { each: true })
  @IsNotEmpty()
  scanners: ScanType[];

  @ApiProperty({
    description:
      'Target to scan. For example, an NPM package name, GitHub repository URL, or file path.',
    example: 'https://github.com/expressjs/express',
  })
  @IsString()
  @IsNotEmpty()
  target: string;

  @ApiPropertyOptional({
    description: 'ID of the project to associate the scan with.',
  })
  @IsOptional()
  @IsString()
  projectId?: string;
}
