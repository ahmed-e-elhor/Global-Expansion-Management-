import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CountryAnalyticsDTO } from './dto/top-vendors.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN, UserRole.ANALYST)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('top-vendors')
  // Returns top vendors by country with research documents count
  async getTopVendorsByCountry(): Promise<CountryAnalyticsDTO[]> {
    return this.analyticsService.getTopVendorsPerCountryWithResearchDocs();
  }
}
