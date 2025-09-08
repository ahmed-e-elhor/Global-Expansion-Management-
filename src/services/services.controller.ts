import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards, ValidationPipe } from '@nestjs/common';

import { CreateServiceDto } from './dto/create-service.dto';
import { UserRole } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Body(new ValidationPipe()) createServiceDto: CreateServiceDto,
  ) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.findById(id);
  }
}
