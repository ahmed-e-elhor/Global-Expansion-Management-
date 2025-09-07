import { IsString, IsNotEmpty, IsArray, IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNotEmpty({ each: true })
  @IsArray()
  @IsUUID('all', { each: true })
  countries: string[];

  @IsArray()
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  @Type(() => String)
  serviceIds: string[];

  @IsOptional()
  @IsNumber({ allowNaN: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Max(5)
  rating?: number;

  @IsNumber()
  @IsNotEmpty()
  responseSlaHours: number;

  
}
