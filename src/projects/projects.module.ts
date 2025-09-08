import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { VendorMatch } from './entities/vendor-match.entity';
import { ProjectsService } from './projects.service';
import { VendorMatchingService } from './vendor-matching.service';
import { ProjectsController } from './projects.controller';
import { Client } from '../clients/entities/client.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { MailModule } from '../mail/mail.module';
import { CountriesModule } from '../countries/countries.module';
import { Service } from '../services/entities/service.entity';
import { Country } from '../countries/entities/country.entity';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Client,
      VendorMatch,
      Vendor,
      Service,
      Country
    ]),
    MailModule,
    CountriesModule,
    ServicesModule
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    VendorMatchingService
  ],
  exports: [
    ProjectsService,
    VendorMatchingService,
    // TypeOrmModule
  ]
})
export class ProjectsModule { }
