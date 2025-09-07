import { DataSource } from 'typeorm';
import { Service } from '../services/entities/service.entity';

/**
 * Services seeder - populates the services table with initial data
 * Adds common business services for global expansion
 */
export class ServicesSeeder {
  constructor(private dataSource: DataSource) {}

  /**
   * Seeds the services table with initial data
   * Prevents duplicate entries by checking existing records
   */
  async run(): Promise<void> {
    const serviceRepository = this.dataSource.getRepository(Service);

    // Define seed data for business services
    const services = [
      {
        name: 'Legal Consultation',
        description: 'Legal advisory services for business setup and compliance'
      },
      {
        name: 'Market Research',
        description: 'Comprehensive market analysis and competitive intelligence'
      },
      {
        name: 'Financial Advisory',
        description: 'Financial planning and investment advisory services'
      },
      {
        name: 'HR & Recruitment',
        description: 'Human resources management and talent acquisition'
      },
      {
        name: 'Digital Marketing',
        description: 'Online marketing and digital presence optimization'
      }
    ];

    console.log('🔧 Seeding services...');

    for (const serviceData of services) {
      // Check if service already exists
      const existingService = await serviceRepository.findOne({
        where: { name: serviceData.name }
      });

      if (!existingService) {
        const service = serviceRepository.create(serviceData);
        await serviceRepository.save(service);
        console.log(`✅ Created service: ${serviceData.name}`);
      } else {
        console.log(`⚠️  Service already exists: ${serviceData.name}`);
      }
    }

    console.log('🎉 Services seeding completed!');
  }
}
