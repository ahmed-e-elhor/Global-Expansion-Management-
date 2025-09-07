import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorMatch } from './entities/vendor-match.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Project } from './entities/project.entity';
import { VendorMatchDto } from './dto/vendor-match.dto';
import { Country } from '../countries/entities/country.entity';
import { MailService } from '../mail/mail.service';

interface VendorMatchResult {
  vendorId: string;
  vendorRating: number;
  servicesOverlap: number;
  slaWeight: number;
}

@Injectable()
export class VendorMatchingService {
  private readonly logger = new Logger(VendorMatchingService.name);

  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorMatch)
    private readonly vendorMatchRepository: Repository<VendorMatch>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly mailService: MailService,
  ) { }



  /**
   * List all vendor matches for a project
   * @param projectId - The ID of the project
   * @returns Promise<VendorMatch[]> - Array of vendor matches
   */
  async listMatches(projectId: string): Promise<VendorMatchDto[]> {
    const matches = await this.vendorMatchRepository.find({
      where: { projectId },
      relations: ['vendor']
    });
    return matches;
  }
  /**
   * Find and score matching vendors for a project 
   * @param project - The project to find matches for
   * @returns Promise<VendorMatchDto[]> - Array of vendor matches with scores
   */
  async findAndScoreVendors(project: Project): Promise<VendorMatchDto[]> {
    // Get vendor matches with service overlap count
    const vendorMatches = await this.getVendorMatchesWithOverlap(project);

    // Process matches and calculate scores
    const results = await Promise.all(
      vendorMatches.map(match => this.processVendorMatch(project.id, match))
    );

    return results.filter(Boolean) as VendorMatchDto[];
  }

  // /**
  //  * Get vendor matches with service overlap count using optimized query
  //  * @private
  //  */
  private async getVendorMatchesWithOverlap(
    project: Project
  ): Promise<VendorMatchResult[]> {
    if (!project.country?.id || !project.services?.length) {
      this.logger.warn(`Project ${project.id} is missing country (${project.country?.id}) or services (${project.services?.length})`);
      return [];
    }

    const projectServiceIds = project.services.map(service => service.id);
    const projectCountryId = project.country.id;

    // Debug logging
    this.logger.debug(`Searching for vendors with countryId: ${projectCountryId} and serviceIds: ${JSON.stringify(projectServiceIds)}`);

    try {
      // Query to find ACTIVE vendors that support the project's country and have service overlap
      const query = this.vendorRepository
        .createQueryBuilder('vendor')
        .innerJoin('vendor.countries_supported', 'country', 'country.id = :countryId', {
          countryId: projectCountryId
        })
        .innerJoin('vendor.services', 'service')
        .where('service.id IN (:...serviceIds)', { serviceIds: projectServiceIds })
        
        .select([
          'vendor.id as vendorId',
          'vendor.rating as vendorRating',
          'vendor.responseSlaHours as responseSlaHours',
          'COUNT(service.id) as servicesOverlap'
        ])
        .groupBy('vendor.id, vendor.rating, vendor.responseSlaHours')
        .having('COUNT(service.id) > 0')
        .orderBy('COUNT(service.id)', 'DESC')
        .addOrderBy('vendor.rating', 'DESC');

      // Log the generated SQL for debugging
      const sql = query.getSql();
      this.logger.debug(`Executing SQL: ${sql}`);
      this.logger.debug(`With parameters: ${JSON.stringify(query.getParameters())}`);

      const results = await query.getRawMany();
      this.logger.debug(`Found ${results.length} vendor matches`);

      if (results.length === 0) {
        this.logger.warn(`No active vendors found for project ${project.id} in country ${projectCountryId} with services ${JSON.stringify(projectServiceIds)}`);
        return [];
      }

      const mappedResults = results.map(result => {
        const responseSlaHours = parseInt(result.responseSlaHours);
        return {
          vendorId: result.vendorId,
          vendorRating: parseFloat(result.vendorRating) || 0,
          servicesOverlap: parseInt(result.servicesOverlap),
          slaWeight: isNaN(responseSlaHours) ? 0 : this.calculateSlaWeight(responseSlaHours)
        };
      });

      this.logger.debug(`Mapped results: ${JSON.stringify(mappedResults)}`);
      return mappedResults;
    } catch (error) {
      this.logger.error(`Error finding vendor matches for project ${project.id}: ${error.message}`, error.stack);
      return [];
    }
  }

  // /**
  //  * Process a single vendor match and save it
  //  * @private
  //  */
  private async processVendorMatch(
    projectId: string,
    match: VendorMatchResult
  ): Promise<VendorMatchDto | null> {
    try {
      const score = this.calculateScore(
        match.servicesOverlap,
        match.vendorRating,
        match.slaWeight
      );

      // Check if match already exists
      const existingMatch = await this.vendorMatchRepository.findOne({
        where: {
          projectId,
          vendorId: match.vendorId
        },
        relations: ['vendor']
      });

      if (existingMatch) {
        // Update existing match
        existingMatch.score = score;
        existingMatch.servicesOverlap = match.servicesOverlap;
        existingMatch.vendorRating = match.vendorRating;
        existingMatch.slaWeight = match.slaWeight;
        existingMatch.updatedAt = new Date();

        const updatedMatch = await this.vendorMatchRepository.save(existingMatch);
        return this.mapToVendorMatchDto(updatedMatch);
      }

      // Create new match
      const newMatch = this.vendorMatchRepository.create({
        projectId,
        vendorId: match.vendorId,
        score,
        isAccepted: false,
        servicesOverlap: match.servicesOverlap,
        vendorRating: match.vendorRating,
        slaWeight: match.slaWeight
      });

      const savedMatch = await this.vendorMatchRepository.save(newMatch);

      // Send notification for new match
      await this.sendNewMatchNotification(savedMatch);

      return this.mapToVendorMatchDto(savedMatch);
    } catch (error) {
      this.logger.error(
        `Error processing vendor match for vendor ${match.vendorId}: ${error.message}`,
        error.stack
      );
      return null;
    }
  }

  // /**
  //  * Calculate match score based on service overlap and vendor rating
  //  * @private
  //  */
  private calculateSlaWeight(responseSlaHours: number): number {
    // Lower response time = higher weight
    // Max SLA hours is 168 (1 week), so we normalize to a 0-10 scale
    const normalizedSla = Math.max(0, 168 - responseSlaHours) / 16.8;
    return parseFloat(normalizedSla.toFixed(2));
  }

  private calculateScore(servicesOverlap: number, vendorRating: number, slaWeight: number): number {
    // Weighted score calculation:
    // - Services overlap is most important (60% weight)
    // - Vendor rating is important (30% weight)
    // - SLA weight is a bonus (10% weight)
    const score = (servicesOverlap * 0.6) + (vendorRating * 0.3) + (slaWeight * 0.1);
    return parseFloat(score.toFixed(2));
  }

  // /**
  //  * Map VendorMatch entity to DTO
  //  * @private
  //  */
  /**
   * Send email notification for new vendor match
   * @private
   */
  private async sendNewMatchNotification(vendorMatch: VendorMatch): Promise<void> {
    try {
      // Get the full vendor and project details for notification
      const matchWithRelations = await this.vendorMatchRepository.findOne({
        where: { id: vendorMatch.id },
        relations: ['vendor', 'project', 'project.client', 'project.client.user']
      });

      if (!matchWithRelations?.project?.client?.user?.email) {
        this.logger.warn(`Cannot send notification: missing client email for match ${vendorMatch.id}`);
        return;
      }

      const { project, vendor } = matchWithRelations;
      const clientEmail = project.client.user.email;
      const projectName = project.id;
      const vendorName = vendor.name;
      const matchDetails = `Score: ${vendorMatch.score}, Services Overlap: ${vendorMatch.servicesOverlap}, Vendor Rating: ${vendorMatch.vendorRating}`;

      const success = await this.mailService.sendMatchNotification(
        clientEmail,
        projectName,
        vendorName,
        matchDetails
      );

      if (success) {
        this.logger.log(`Match notification sent successfully for project ${projectName} and vendor ${vendorName}`);
      } else {
        this.logger.error(`Failed to send match notification for project ${projectName} and vendor ${vendorName}`);
      }
    } catch (error) {
      this.logger.error(`Error sending match notification: ${error.message}`, error.stack);
    }
  }

  private mapToVendorMatchDto(match: VendorMatch): VendorMatchDto {
    return {
      id: match.id,
      vendorId: match.vendor.id,
      // vendorName: match.vendor.name,
      score: match.score,
      isAccepted: match.isAccepted,
      // servicesOverlap: match.servicesOverlap,
      // vendorRating: match.vendorRating,
      // slaWeight: match.slaWeight,
      // responseSlaHours: match.vendor.responseSlaHours,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt
    };
  }

}
