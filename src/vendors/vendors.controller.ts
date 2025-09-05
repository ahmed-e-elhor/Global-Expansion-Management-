import { Controller, Get, Post, Body, UseGuards, Req, ValidationPipe } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { Vendor } from './entities/vendor.entity';


@Controller('vendors')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))createVendorDto: CreateVendorDto,
    @Req() req
  ) {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  async findAll() {
    return this.vendorsService.findAll();
  }
}
