import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { VendorMatch } from './entities/vendor-match.entity';
import { Client } from '../clients/entities/client.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { RebuildMatchesResponseDto, VendorMatchDto } from './dto/vendor-match.dto';

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
  ) { }


  async findById(id: string, relations: string[] = ['client', 'client.user']): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations,
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  /**
   * Rebuild vendor matches for a project
   * @param projectId - The ID of the project to rebuild matches for
   * @returns Promise<RebuildMatchesResponseDto>
   */
  async rebuildVendorMatches(projectId: string): Promise<RebuildMatchesResponseDto> {
    this.logger.log(`Rebuilding vendor matches for project ${projectId}`);

    // 1. Get the project with required relations
    const project = await this.findById(projectId, ['client', 'client.user']);

    // 2. Find all vendors that match the project's country and have at least one service in common
    const matchingVendors = await this.findMatchingVendors(project);

    // 3. Calculate scores for each vendor
    const vendorScores = await this.calculateVendorScores(project, matchingVendors);

    // 4. Save the matches to the database
    const savedMatches = await this.saveVendorMatches(projectId, vendorScores);

    // 5. Map to DTOs for the response
    const matchDtos = savedMatches.map(match => this.mapToVendorMatchDto(match));

    return {
      projectId,
      matchesCount: matchDtos.length,
      matches: matchDtos
    };
  }

  /**
   * Find vendors that match the project's country and have at least one service in common
   */
  /**
   * Find vendors that match the project's country and have at least one service in common
   */
  // private async findMatchingVendors(project: Project): Promise<Array<{
  //   id: string;
  //   country: string;
  //   services: string[];
  //   rating: number;
  //   slaCompliance: number;
  // }>> {
  //   // First, find all vendors that support the project's country
  //   const vendors = await this.vendorRepository
  //     .createQueryBuilder('vendor')
  //     .where('FIND_IN_SET(:country, vendor.countries_supported) > 0', {
  //       country: project.country,
  //     })
  //     .andWhere('vendor.user IS NOT NULL') // Only vendors with user accounts
  //     .getMany();

  //   // Filter vendors by service overlap and calculate SLA compliance
  //   return vendors
  //     .map(vendor => {
  //       // Find overlapping services
  //       const overlappingServices = vendor.services_offered.filter(service => 
  //         project.services_needed.includes(service)
  //       );

  //       // Only include vendors with at least one matching service
  //       if (overlappingServices.length === 0) {
  //         return null;
  //       }

  //       // Calculate SLA compliance based on response time
  //       // Assuming lower responseSlaHours is better (faster response)
  //       // Convert to a 0-1 scale where 24h = 0.5, 1h = 1.0, 48h = 0.0, etc.
  //       const slaCompliance = Math.max(0, 1 - (vendor.responseSlaHours / 48));

  //       return {
  //         id: vendor.id,
  //         country: project.country, // Use project's country since we've already filtered by it
  //         services: vendor.services_offered,
  //         rating: parseFloat(vendor.rating.toFixed(2)),
  //         slaCompliance: parseFloat(slaCompliance.toFixed(2)),
  //       };
  //     })
  //     .filter(Boolean); // Remove null entries (vendors with no matching services)
  // }

  private async findMatchingVendors(project: Project): Promise<Array<{
    id: string;
    country: string;
    services: string[];
    rating: number;
    slaCompliance: number;
  }>> {
    // First, find all vendors that support the project's country
    const vendors = await this.vendorRepository
      .createQueryBuilder('vendor')
      .where('FIND_IN_SET(:country, vendor.countries_supported) > 0', {
        country: project.country,
      })
      .getMany();

    // Filter vendors by service overlap and calculate SLA compliance
    return vendors
      .map(vendor => {
        // Find overlapping services
        const overlappingServices = vendor.services_offered.filter(service =>
          project.services_needed.includes(service)
        );

        // Only include vendors with at least one matching service
        if (overlappingServices.length === 0) {
          return null;
        }

        // Calculate SLA compliance based on response time
        const slaCompliance = Math.max(0, 1 - (vendor.responseSlaHours / 48));

        return {
          id: vendor.id,
          country: project.country,
          services: vendor.services_offered,
          rating: parseFloat(Number(vendor.rating || 0).toFixed(2)),
          slaCompliance: parseFloat(Number(slaCompliance || 0).toFixed(2)),
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);
  }

  /**
   * Calculate scores for each matching vendor
   */
  private async calculateVendorScores(project: Project, vendors: any[]): Promise<Array<{ vendorId: string, score: number }>> {
    return vendors.map(vendor => {
      // Calculate service overlap (number of matching services)
      const servicesOverlap = vendor.services.filter((service: string) =>
        project.services_needed.includes(service)
      ).length;

      // Calculate score using the formula: services_overlap * 2 + rating + SLA_weight
      // Assuming SLA_weight is a value between 0 and 1 (e.g., 0.9 for 90% compliance)
      const score = (servicesOverlap * 2) + vendor.rating + vendor.slaCompliance;

      return {
        vendorId: vendor.id,
        score: parseFloat(score.toFixed(2)) // Round to 2 decimal places
      };
    });
  }

  /**
   * Save vendor matches to the database with idempotent upsert logic
   */
  private async saveVendorMatches(
    projectId: string,
    vendorScores: Array<{ vendorId: string, score: number }>
  ): Promise<VendorMatch[]> {
    const matchesToSave = vendorScores.map(({ vendorId, score }) => {
      const match = new VendorMatch({
        projectId,
        vendorId,
        score,
        isAccepted: false
      });
      return match;
    });

    // Delete existing matches for this project
    await this.vendorMatchRepository.delete({ projectId });

    // Save new matches
    return this.vendorMatchRepository.save(matchesToSave);
  }


  listMatches(projectId: string): Promise<VendorMatch[]> {
    return this.vendorMatchRepository.find({ where: { projectId } });
  }

  /**
   * Map VendorMatch entity to DTO
   */
  private mapToVendorMatchDto(match: VendorMatch): VendorMatchDto {
    return {
      id: match.id,
      vendorId: match.vendorId,
      score: match.score,
      isAccepted: match.isAccepted,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt
    };
  }

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    // Find the client associated with the user
    const client = await this.clientsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (!client) {
      throw new ForbiddenException('Only clients can create projects');
    }

    const project = this.projectsRepository.create({
      ...createProjectDto,
      client,
      status: ProjectStatus.ACTIVE,
    });

    return this.projectsRepository.save(project);
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['client', 'client.user']
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
