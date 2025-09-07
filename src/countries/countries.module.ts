import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountriesController } from './countries.controller';
import { CountryService } from './countries.service';
import { Country } from './entities/country.entity';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country]),
  ],
  controllers: [CountriesController],
  providers: [CountryService],
  exports: [
    CountryService,
    // TypeOrmModule
  ]
})
export class CountriesModule {}
