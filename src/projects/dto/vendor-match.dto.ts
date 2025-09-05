import { ApiProperty } from '@nestjs/swagger';

export class VendorMatchDto {
  @ApiProperty({ description: 'Unique identifier for the vendor match' })
  id: string;

  @ApiProperty({ description: 'Vendor ID' })
  vendorId: string;

  @ApiProperty({ description: 'Match score calculated based on the matching algorithm' })
  score: number;

  @ApiProperty({ description: 'Whether the match has been accepted' })
  isAccepted: boolean;

  @ApiProperty({ description: 'Date when the match was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the match was last updated' })
  updatedAt: Date;
}

export class RebuildMatchesResponseDto {
  @ApiProperty({ description: 'Project ID for which matches were rebuilt' })
  projectId: string;

  @ApiProperty({ 
    description: 'Number of vendor matches found',
    type: Number 
  })
  matchesCount: number;

  @ApiProperty({ 
    description: 'List of vendor matches',
    type: [VendorMatchDto] 
  })
  matches: VendorMatchDto[];
}
