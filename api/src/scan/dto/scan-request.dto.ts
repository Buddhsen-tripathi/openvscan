import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum ScanType {
  NPM = 'npm',
  PACKAGE_JSON = 'package-json',
}

export class ScanRequestDto {
  @IsEnum(ScanType)
  @IsNotEmpty()
  type: ScanType;

  @IsString()
  @IsNotEmpty()
  target: string;

  @IsOptional()
  @IsString()
  version?: string;
}
