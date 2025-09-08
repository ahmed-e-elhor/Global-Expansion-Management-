import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { User } from '../users/entities/user.entity';
import { UpdateResult } from 'typeorm/browser';
import { Service } from '../services/entities/service.entity';
import { Country } from '../countries/entities/country.entity';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) { }

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    const { serviceIds, countries, ...vendorData } = createVendorDto;

    // Create the vendor with basic data
    const vendor = this.vendorRepository.create({
      ...vendorData,
      rating: vendorData.rating || 0,
    });

    // If serviceIds are provided, create the vendor-services relationships
    if (serviceIds && serviceIds.length > 0) {
      vendor.services = serviceIds.map(id => ({ id } as Service));
    }

    // If countries are provided, create the vendor-countries relationships
    if (countries && countries.length > 0) {
      vendor.countries_supported = countries.map(id => ({ id } as Country));
    }

    // Save the vendor with all relationships
    return this.vendorRepository.save(vendor);
  }

  async findAll(): Promise<Vendor[]> {
    return this.vendorRepository.find();
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    return vendor;
  }


  // Get vendors with expired SLAs
  async getVendorsWithExpiredSLAs(): Promise<Vendor[]> {
    return this.vendorRepository
      .createQueryBuilder('vendor')
      .where('vendor.responseSlaHours < :now', { now: new Date() })
      .getMany();
  }


  async update(id: string,updateVendorDto: Partial<Vendor>):
    Promise<UpdateResult> {

    return this.vendorRepository.update(id, updateVendorDto);
  }

}
