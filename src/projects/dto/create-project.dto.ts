import { IsString, IsNotEmpty, IsArray, IsNumber, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  // // @IsUUID()
  // // // @IsNotEmpty()
  // clientId: string;

  @IsNotEmpty()
  @IsUUID()
  country_id: string;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  @Type(() => String)
  serviceIds: string[];

  @IsNumber()
  @IsNotEmpty()
  budget: number;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;
}
