import { IsString, IsNotEmpty, IsArray, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  countries_supported: string[];

  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  services_offered: string[];

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsNumber()
  @IsNotEmpty()
  responseSlaHours: number;

  
}
