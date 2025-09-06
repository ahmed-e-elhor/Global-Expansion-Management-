import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { VendorMatch } from '../../projects/entities/vendor-match.entity';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('simple-array')
  countries_supported: string[];

  @Column('simple-array')
  services_offered: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({type: 'enum', enum: ['ACTIVE', 'SLA_EXPIRED'], default: 'ACTIVE' })
  status: string;

  @Column({ name: 'response_sla_hours' })
  responseSlaHours: number;

  @OneToMany(() => VendorMatch, vendorMatch => vendorMatch.vendor)
  vendorMatches: VendorMatch[];
}
