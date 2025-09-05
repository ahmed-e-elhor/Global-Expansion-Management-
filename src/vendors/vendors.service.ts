import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    // Ensure rating is a number and has a default value if not provided
    const vendorData = {
      ...createVendorDto,
      rating: createVendorDto.rating || 0,
    };
    
    const vendor = this.vendorRepository.create(vendorData);
    return this.vendorRepository.save(vendor);
  }

  async findAll(): Promise<Vendor[]> {
    return this.vendorRepository.find({
      relations: ['user'],
    });
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
}
