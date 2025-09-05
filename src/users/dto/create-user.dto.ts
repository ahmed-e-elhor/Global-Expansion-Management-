import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ValidateIf(o => o.role === UserRole.CLIENT || o.role === undefined)
  @IsString()
  @IsNotEmpty({ message: 'company_name is required for clients.' })
  company_name?: string;

}
