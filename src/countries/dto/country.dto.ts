import { ApiProperty } from '@nestjs/swagger';

export class CountryDto {
  @ApiProperty({ description: 'The unique identifier of the country' })
  id: string;

  @ApiProperty({ description: 'The 2-letter country code', example: 'US' })
  code: string;

  @ApiProperty({ description: 'The full name of the country', example: 'United States' })
  name: string;

}
