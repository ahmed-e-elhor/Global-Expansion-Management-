import { IsString, IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  company_name: string;

  
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
