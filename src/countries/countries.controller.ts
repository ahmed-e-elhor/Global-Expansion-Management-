import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CountryDto } from './dto/country.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CountryService } from './countries.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { CreateCountryDto } from './dto/craete-country.dto';

@ApiTags('countries')
@Controller('countries')
export class CountriesController {
  constructor(
    private countriesService: CountryService
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all countries', description: 'Retrieves a list of all countries' })
  @ApiResponse({ status: 200, description: 'List of countries', type: () => [CountryDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(): Promise<CountryDto[]> {
    return this.countriesService.findAll();
  }


  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a country', description: 'Creates a new country' })
  @ApiResponse({ status: 201, description: 'Country created successfully', type: CountryDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createCountryDto: CreateCountryDto): Promise<CountryDto> {
    return this.countriesService.create(createCountryDto);
  }

}
