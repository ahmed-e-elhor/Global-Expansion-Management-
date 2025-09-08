import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Country } from '../countries/entities/country.entity';
import { Service } from '../services/entities/service.entity';
import { Project } from '../projects/entities/project.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { VendorMatch } from '../projects/entities/vendor-match.entity';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { ServicesSeeder } from './services.seeder';


/**
 * Standalone seeder that only connects to MySQL database
 * Bypasses NestJS application context to avoid MongoDB dependency
 */
async function runStandaloneSeeder() {
  console.log('🚀 Starting standalone database seeding (MySQL only)...');

  const configService = new ConfigService();

  // Create MySQL DataSource directly
  const dataSource = new DataSource({
    type: 'mysql',
    host: configService.get('MYSQL_HOST') || 'localhost',
    port: parseInt(configService.get('MYSQL_PORT')!) || 3307,
    username: configService.get('MYSQL_USERNAME') || 'root',
    password: configService.get('MYSQL_PASSWORD') || '1234',
    database: configService.get('MYSQL_DATABASE') || 'mysql_expanderdb',
    entities: [Country, Service, Project, Vendor, VendorMatch, Client, User],
    synchronize: false, // Don't auto-sync in production
    logging: false,
  });

  try {
    // Initialize database connection
    await dataSource.initialize();
    console.log('✅ MySQL database connection established');

    // Run Countries Seeder
    console.log('🌍 Seeding countries...');
    const countryRepository = dataSource.getRepository(Country);

    const countries = [
      {
        code: 'UK',
        name: 'United Kingdom'
      },
      {
        code: 'AE', 
        name: 'United Arab Emirates'
      },
      {
        code: 'SA',
        name: 'Saudi Arabia'
      }
    ];

    for (const countryData of countries) {
      const existingCountry = await countryRepository.findOne({
        where: { code: countryData.code }
      });

      if (!existingCountry) {
        const country = countryRepository.create(countryData);
        await countryRepository.save(country);
        console.log(`✅ Created country: ${countryData.name} (${countryData.code})`);
      } else {
        console.log(`⚠️  Country already exists: ${countryData.name} (${countryData.code})`);
      }
    }

    console.log('🎉 Countries seeding completed!');

    // Run Services Seeder
    const servicesSeeder = new ServicesSeeder(dataSource);
    await servicesSeeder.run();

    console.log('✨ All seeders completed successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

// Execute the seeder
runStandaloneSeeder();
