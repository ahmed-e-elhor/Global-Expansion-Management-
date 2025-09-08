import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';
import { Project } from '../projects/entities/project.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, Project, Vendor]),
    forwardRef(() => ProjectsModule)
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [
    ServicesService,
    TypeOrmModule
  ]
})
export class ServicesModule {}
