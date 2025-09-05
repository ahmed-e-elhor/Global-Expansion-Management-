import { Controller, UseGuards, Get } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.clientsService.findAll();
  }
}
