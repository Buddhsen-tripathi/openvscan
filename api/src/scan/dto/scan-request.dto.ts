import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScanType } from '../types';

export class ScanRequestDto {
  @ApiProperty({
    enum: ScanType,
    description: 'Specifies the type of scan to perform.',
    example: ScanType.NPM,
  })
  @IsEnum(ScanType)
  @IsNotEmpty()
  type: ScanType;

  @ApiProperty({
    description:
      'Target to scan. For example, an NPM package name, GitHub repository URL, or file path.',
    example: 'express',
  })
  @IsString()
  @IsNotEmpty()
  target: string;

  @ApiPropertyOptional({
    description:
      'Optional version of the target to scan. If omitted, the latest version will be scanned.',
    example: '4.18.2',
  })
  @IsOptional()
  @IsString()
  @Matches(/^(\d+\.)?(\d+\.)?(\*|\d+)$/, {
    message: 'version must follow semantic versioning (e.g., 1.2.3)',
  })
  version?: string;
}
