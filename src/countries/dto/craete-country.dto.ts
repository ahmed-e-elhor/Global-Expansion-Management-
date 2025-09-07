import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCountryDto {

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
