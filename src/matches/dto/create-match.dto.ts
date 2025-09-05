import { IsUUID, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateMatchDto {
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsUUID()
  @IsNotEmpty()
  vendorId: string;

  @IsNumber()
  @IsNotEmpty()
  score: number;
}
