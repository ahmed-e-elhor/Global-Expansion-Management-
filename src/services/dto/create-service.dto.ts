import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
