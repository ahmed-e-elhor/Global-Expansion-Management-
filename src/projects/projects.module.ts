import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { VendorMatch } from './entities/vendor-match.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Client } from '../clients/entities/client.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Client, VendorMatch, Vendor]),
    MailModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
