import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../projects/entities/project.entity';
import { CountryAnalyticsDTO, VendorSummaryDTO } from './dto/top-vendors.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentModel } from '../documents/schemas/document.schema';
import { VendorMatch } from '../projects/entities/vendor-match.entity';
import { DataSource } from 'typeorm';

declare module 'typeorm' {
  interface Repository<Entity> {
    query(query: string, parameters?: any[]): Promise<any>;
  }
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    // @InjectRepository(Country) private readonly countryRepo: Repository<Country>,
    // @InjectRepository(Vendor) private readonly vendorRepository: Repository<Vendor>,
    private readonly dataSource: DataSource,
    @InjectRepository(VendorMatch) private readonly vendorMatchRepo: Repository<VendorMatch>,
    @InjectModel(DocumentModel.name) private readonly documentModel: Model<DocumentModel>,
  ) { }


 

  /**
   * Returns top 3 vendors per country based on match scores and document counts
   * 
   * Architecture:
   * - Uses hybrid approach: MySQL for vendor data, MongoDB for document counts, in-memory processing for ranking
   * - Executes database queries in parallel for optimal performance
   * 
   * @returns Promise<CountryAnalyticsDTO[]> Array of countries with their top vendors and document counts
   */
  async getTopVendorsPerCountryWithResearchDocs(): Promise<CountryAnalyticsDTO[]> {
    // Execute data retrieval operations in parallel for optimal performance
    const [vendorMatchData, documentCounts] = await Promise.all([
      this.getVendorMatchDataFromMySQL(),
      this.getDocumentCountsFromMongoDB()
    ]);

    // Process and merge data in-memory for efficiency
    return this.processAndMergeAnalyticsData(vendorMatchData, documentCounts);
  }

  /**
   * Retrieves vendor match data from MySQL with optimized query
   * 
   * Performance optimizations:
   * - Uses raw SQL with window functions (ROW_NUMBER) for efficient ranking
   * - Subquery approach to handle window function filtering limitations
   * - Joins only active projects to reduce dataset size
   * - Groups by country and vendor to calculate aggregated scores
   * 
   * @returns Promise<VendorMatchRawData[]> Raw vendor match data with rankings
   * @private
   */
  private async getVendorMatchDataFromMySQL(): Promise<VendorMatchRawData[]> {
    const query = `
      SELECT 
        countryCode,
        vendorId,
        vendorName,
        avgScore,
        projectCount,
        ranking
      FROM (
        SELECT 
          c.code as countryCode,
          v.id as vendorId,
          v.name as vendorName,
          AVG(vm.score) as avgScore,
          COUNT(DISTINCT vm.projectId) as projectCount,
          ROW_NUMBER() OVER (
            PARTITION BY c.code 
            ORDER BY AVG(vm.score) DESC, COUNT(DISTINCT vm.projectId) DESC
          ) as ranking
        FROM vendor_matches vm
        INNER JOIN projects p ON vm.projectId = p.id
        INNER JOIN countries c ON p.country_id = c.id
        INNER JOIN vendors v ON vm.vendorId = v.id
        WHERE p.status = 'active'
        GROUP BY c.code, v.id, v.name
      ) ranked_vendors
      WHERE ranking <= 3
      ORDER BY countryCode, ranking
    `;

    return await this.dataSource.manager.query(query);
  }

  /**
   * Retrieves document counts per country from MongoDB
   * 
   * MongoDB optimization strategy:
   * - First fetches active projects from MySQL with minimal data (id, country)
   * - Groups project IDs by country code for efficient processing
   * - Uses MongoDB aggregation pipeline to count documents per project
   * - Calculates total document counts per country in-memory
   * 
   * @returns Promise<Map<string, number>> Map of country codes to document counts
   * @private
   */
  private async getDocumentCountsFromMongoDB(): Promise<Map<string, number>> {
    // First, get active projects grouped by country
    const activeProjects = await this.projectRepo.find({
      where: { status: ProjectStatus.ACTIVE },
      relations: ['country'],
      select: ['id', 'country']
    });

    // Group project IDs by country code for efficient lookup
    const projectsByCountry = this.groupProjectsByCountry(activeProjects);
    
    // Get all project IDs for MongoDB query
    const allProjectIds = Array.from(projectsByCountry.values()).flat();
    
    if (allProjectIds.length === 0) {
      return new Map();
    }

    // Aggregate document counts by project
    const documentCounts = await this.documentModel.aggregate([
      { $match: { projectId: { $in: allProjectIds } } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } }
    ]).exec();

    // Calculate total document count per country
    return this.calculateDocumentCountsByCountry(projectsByCountry, documentCounts);
  }

  /**
   * Groups active projects by country code
   * Follows Single Responsibility Principle - handles only project grouping logic
   */
  private groupProjectsByCountry(projects: Project[]): Map<string, string[]> {
    return projects.reduce((acc, project) => {
      if (project.country?.code) {
        const countryCode = project.country.code;
        if (!acc.has(countryCode)) {
          acc.set(countryCode, []);
        }
        acc.get(countryCode)!.push(project.id);
      }
      return acc;
    }, new Map<string, string[]>());
  }

  /**
   * Calculates document counts by country from MongoDB aggregation results
   * Optimized for memory efficiency with Map-based lookups
   */
  private calculateDocumentCountsByCountry(
    projectsByCountry: Map<string, string[]>,
    documentCounts: Array<{ _id: string; count: number }>
  ): Map<string, number> {
    // Create efficient lookup map for document counts
    const projectDocCountMap = new Map(
      documentCounts.map(doc => [doc._id, doc.count])
    );

    const result = new Map<string, number>();

    // Calculate total documents per country
    for (const [countryCode, projectIds] of projectsByCountry.entries()) {
      const totalDocuments = projectIds.reduce(
        (sum, projectId) => sum + (projectDocCountMap.get(projectId) || 0),
        0
      );
      result.set(countryCode, totalDocuments);
    }

    return result;
  }

  /**
   * Processes and merges vendor and document data in-memory
   */
  private processAndMergeAnalyticsData(
    vendorData: VendorMatchRawData[],
    documentCounts: Map<string, number>
  ): CountryAnalyticsDTO[] {
    // Group vendors by country for efficient processing
    const vendorsByCountry = this.groupVendorsByCountry(vendorData);
    
    // Get all unique country codes from both data sources
    const allCountryCodes = new Set([
      ...vendorsByCountry.keys(),
      ...documentCounts.keys()
    ]);

    // Build final result with proper data structure
    return Array.from(allCountryCodes).map(countryCode => ({
      countryCode,
      vendors: this.formatVendorsForCountry(vendorsByCountry.get(countryCode) || []),
      documentCount: documentCounts.get(countryCode) || 0
    }));
  }

  /**
   * Groups vendor match data by country code while preserving ranking order
   * 
   * Data integrity:
   * - Maintains ranking order established by SQL window function
   * - Creates efficient country-based groupings for final processing
   * - Preserves all vendor metadata for formatting step
   * 
   * @param vendorData Array of vendor match data with rankings
   * @returns Map<string, VendorMatchRawData[]> Vendors grouped by country code
   * @private
   */
  private groupVendorsByCountry(vendorData: VendorMatchRawData[]): Map<string, VendorMatchRawData[]> {
    return vendorData.reduce((acc, vendor) => {
      if (!acc.has(vendor.countryCode)) {
        acc.set(vendor.countryCode, []);
      }
      acc.get(vendor.countryCode)!.push(vendor);
      return acc;
    }, new Map<string, VendorMatchRawData[]>());
  }

  /**
   * Formats vendor data to match API response structure
   * - Returns only required fields (id, name) as specified in API contract
   * @param vendors Array of vendor match data for a specific country
   * @returns VendorSummaryDTO[] Formatted vendor data for API response
   * @private
   */
  private formatVendorsForCountry(vendors: VendorMatchRawData[]): VendorSummaryDTO[] {
    return vendors.map(vendor => ({
      id: vendor.vendorId,
      name: vendor.vendorName
    }));
  }
}

interface VendorMatchRawData {
  countryCode: string;
  vendorId: string;
  vendorName: string;
  avgScore: number;
  projectCount: number;
  ranking: number;

}
