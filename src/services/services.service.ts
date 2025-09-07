import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { Project } from '../projects/entities/project.entity';
import { Vendor } from '../vendors/entities/vendor.entity';

@Injectable()
export class ServicesService {
    constructor(
        @InjectRepository(Service)
        private readonly serviceRepository: Repository<Service>,
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(Vendor)
        private readonly vendorRepository: Repository<Vendor>,
    ) { }

    async create(createServiceDto: CreateServiceDto): Promise<Service> {
        const service = this.serviceRepository.create({
            name: createServiceDto.name,
            description: createServiceDto.description,
        });

        return this.serviceRepository.save(service);
    }






    async findAll(): Promise<Service[]> {
        return this.serviceRepository.find();
    }

    async findById(id: string): Promise<Service> {
        const service = await this.serviceRepository.findOneByOrFail({ id });
        return service;
    }
}
