import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email for registration.',
  })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description:
      'Password must be at least 8 characters long, contain uppercase, lowercase, number, and special character.',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters.' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+/, {
    message:
      'Password must include uppercase, lowercase, number, and special character.',
  })
  password: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    description: 'Optional profile image URL.',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
