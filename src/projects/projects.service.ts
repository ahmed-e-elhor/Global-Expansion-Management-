import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In,  } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { Project, ProjectStatus } from './entities/project.entity';
import { VendorMatch } from './entities/vendor-match.entity';
import { Client } from '../clients/entities/client.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Service } from '../services/entities/service.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { CountryService } from 'src/countries/countries.service';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(VendorMatch)
    private vendorMatchRepository: Repository<VendorMatch>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    private readonly mailService: MailService,
    private readonly countryService: CountryService
  ) { }


  /**
   * Find all active projects
   * @param relations - Optional relations to include
   * @returns Promise<Project[]> - Array of active projects
   */
  async findActive(relations: string[] = [
    'client',
    'client.user',
    'services',
    'country'
  ]): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { status: ProjectStatus.ACTIVE },
      relations,
    });
  }

  /**
   * Find a project by ID with optional relations
   * @param id - Project ID
   * @param relations - Optional relations to include
   * @returns Promise<Project>
   */
  async findById(id: string, relations: string[] = ['client', 'client.user', 'services']): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations,
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: any): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['services']
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Update services if serviceIds are provided
    if (updateProjectDto.serviceIds) {
      project.services = await this.serviceRepository.findBy({
        id: In(updateProjectDto.serviceIds)
      });
      delete updateProjectDto.serviceIds; // Remove to prevent overriding the relationship
    }

    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const project = this.projectsRepository.create(createProjectDto);

    // Set the client relationship
    const client = await this.clientsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${userId} not found`);
    }
    project.client = client;

    // Set the country relationship
    try {
      project.country = await this.countryService.findById(createProjectDto.country_id);
    } catch (error) {
      throw new NotFoundException(`Country with ID ${createProjectDto.country_id} not found`);
    }

    // Set the services relationship if serviceIds are provided
    if (createProjectDto.serviceIds?.length) {
      project.services = await this.serviceRepository.findBy({
        id: In(createProjectDto.serviceIds)
      });
    }

    return this.projectsRepository.save(project);
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['client', 'client.user', 'country']
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (project.client.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to access this project');
    }

    return project;
  }

  async findAllForClient(userId: string): Promise<Project[]> {
    const client = await this.clientsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['projects']
    });

    if (!client) {
      throw new ForbiddenException('Only clients can view their projects');
    }


    return client.projects || [];
  }
}
