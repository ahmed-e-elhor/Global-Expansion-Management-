import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Match } from '../../matches/entities/match.entity';
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

  @Column({ name: 'response_sla_hours' })
  responseSlaHours: number;

  // @OneToOne(() => User)
  // @JoinColumn()
  // user: User;

  @OneToMany(() => Match, match => match.vendor)
  matches: Match[];

  @OneToMany(() => VendorMatch, vendorMatch => vendorMatch.vendor)
  vendorMatches: VendorMatch[];
}
