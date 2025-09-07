import { DataSource } from 'typeorm';
import { Country } from '../countries/entities/country.entity';

/**
 * Countries seeder - populates the countries table with initial data
 * Adds 3 countries: Egypt, United States, and Germany
 */
export class CountriesSeeder {
  constructor(private dataSource: DataSource) {}

  /**
   * Seeds the countries table with initial data
   * Uses INSERT IGNORE to prevent duplicate entries
   */
  async run(): Promise<void> {
    const countryRepository = this.dataSource.getRepository(Country);

    
    const countries = [
      {
        code: 'UK',
        name: 'United Kingdom'
      },
      {
        code: 'UAE', 
        name: 'United Arab Emirates'
      },
      {
        code: 'SA',
        name: 'Saudi Arabia'
      }
    ];

    console.log('🌍 Seeding countries...');

    for (const countryData of countries) {
      // Check if country already exists
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
  }
}
