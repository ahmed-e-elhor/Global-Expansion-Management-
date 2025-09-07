import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { CreateCountryDto } from './dto/craete-country.dto';


@Injectable()
export class CountryService {
  create(createCountryDto: CreateCountryDto): Promise<Country> {
    const country = this.countryRepository.create(createCountryDto);
    return this.countryRepository.save(country);
  }
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async findAll(): Promise<Country[]> {
    const countries = await this.countryRepository.find();
    return countries
  }

  async findById(id: string): Promise<Country> {
    const country = await this.countryRepository.findOneByOrFail({ id });
    return country
  }

}
