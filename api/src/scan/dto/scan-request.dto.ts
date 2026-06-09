import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  MaxLength,
  Matches,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ScanType } from '@openvscan/types';

export class ScanRequestDto {
  @ApiProperty({
    enum: ScanType,
    isArray: true,
    description: 'Specifies the types of scans to perform.',
    example: [ScanType.STATIC_ANALYSIS],
  })
  @IsArray()
  @ArrayMaxSize(4)
  @IsEnum(ScanType, { each: true })
  @IsNotEmpty()
  scanners: ScanType[];

  @ApiProperty({
    description:
      'Target to scan. For example, a Docker image name, GitHub repository URL, or file path.',
    example: 'https://github.com/expressjs/express',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  @Matches(/^[a-zA-Z0-9\-_.:/@+~#?&=%\[\]()]+$/, {
    message: 'Target contains invalid characters',
  })
  target: string;

  @ApiProperty({
    description: 'ID of the project to associate the scan with.',
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;
}
