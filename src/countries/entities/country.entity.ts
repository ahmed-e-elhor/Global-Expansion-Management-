  import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

  @Entity('countries')
  export class Country {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true,})
    code: string;

    @Column()
    name: string;


  }
