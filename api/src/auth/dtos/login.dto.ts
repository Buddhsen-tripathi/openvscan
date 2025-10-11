import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Registered email address of the user.',
  })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description: 'Password for the given email.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}
