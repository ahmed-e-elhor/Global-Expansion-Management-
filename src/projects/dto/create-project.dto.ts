import { IsString, IsNotEmpty, IsArray, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  // // @IsUUID()
  // // // @IsNotEmpty()
  // clientId: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  services_needed: string[];

  @IsNumber()
  @IsNotEmpty()
  budget: number;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;
}
