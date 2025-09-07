import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { VendorMatch } from '../../projects/entities/vendor-match.entity';
import { Service } from '../../services/entities/service.entity';
import { Country } from '../../countries/entities/country.entity';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Country, { eager: true })
  @JoinTable({
    name: 'vendor_countries',
    joinColumn: { name: 'vendor_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'country_id', referencedColumnName: 'id' }
  })
  countries_supported: Country[];

  @ManyToMany(() => Service, service => service.vendors, { eager: true })
  @JoinTable({
    name: 'vendor_services',
    joinColumn: { name: 'vendor_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'service_id', referencedColumnName: 'id' }
  })
  services: Service[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({type: 'enum', enum: ['ACTIVE', 'SLA_EXPIRED'], default: 'ACTIVE' })
  status: string;

  @Column({ name: 'response_sla_hours' })
  responseSlaHours: number;

  @OneToMany(() => VendorMatch, vendorMatch => vendorMatch.vendor)
  vendorMatches: VendorMatch[];
}
