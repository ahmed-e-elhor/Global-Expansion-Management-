import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../projects/entities/project.entity';
import { CountryAnalyticsDTO, TopVendorDTO } from './dto/top-vendors.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentModel } from '../documents/schemas/document.schema';
import { VendorMatch } from 'src/projects/entities/vendor-match.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(VendorMatch) private readonly vendorMatchRepo: Repository<VendorMatch>,
    @InjectModel(DocumentModel.name) private readonly documentModel: Model<DocumentModel>,
  ) {}

  /**
   * Returns top 3 vendors per country by average match score from the last 30 days (MySQL)
   * along with the count of research documents linked to expansion projects in each country (MongoDB)
   */
  async getTopVendorsPerCountryWithResearchDocs(): Promise<CountryAnalyticsDTO[]> {
    // 1) Get top 3 vendors per country by average match score (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const queryResult = await this.vendorMatchRepo
      .createQueryBuilder('vendorMatch')
      .select([
        'project.country as country',
        'vendor.id as vendorId',
        'vendor.name as vendorName',
        'AVG(vendorMatch.score) as avgScore'
      ])
      .innerJoin('vendorMatch.project', 'project')
      .innerJoin('vendorMatch.vendor', 'vendor')
      .where('vendorMatch.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
      .groupBy('project.country, vendor.id, vendor.name')
      .having('COUNT(vendorMatch.id) > 0')
      .orderBy('project.country', 'ASC')
      .addOrderBy('avgScore', 'DESC')
      .getRawMany();

    // Group vendors by country (top 3 per country)
    const byCountry = queryResult.reduce((acc, row) => {
      const country = row.country;
      if (!acc.has(country)) {
        acc.set(country, []);
      }
      
      // Only keep top 3 vendors per country
      if (acc.get(country)!.length < 3) {
        acc.get(country)!.push({
          vendorId: row.vendorId,
          vendorName: row.vendorName,
          avgScore: parseFloat(row.avgScore) || 0,
        });
      }
      
      return acc;
    }, new Map<string, TopVendorDTO[]>());

    // 2) For each country, count research documents from active projects
    const results: CountryAnalyticsDTO[] = [];
    
    // Process each country in parallel for better performance
    await Promise.all(
      Array.from(byCountry.entries()).map(async ([country, topVendors]: [string, TopVendorDTO[]]) => {
        // Get all active project IDs for this country
        const projects = await this.projectRepo.find({
          select: ['id'],
          where: { 
            country,
            status: ProjectStatus.ACTIVE
          },
        });

        let researchDocsCount = 0;
        
        if (projects.length > 0) {
          const projectIds = projects.map(p => p.id);
          
          // Count research documents linked to these projects
          researchDocsCount = await this.documentModel.countDocuments({
            projectId: { $in: projectIds },
            // type: 'research' // Filter by document type
          }).exec();
        }

        results.push({
          country,
          topVendors,
          researchDocsCount,
        });
      })
    );

    return results;
  }
}
