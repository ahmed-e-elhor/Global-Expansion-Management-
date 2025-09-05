import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { VendorsService } from './vendors.service';
import { UsersModule } from '../users/users.module';
import { VendorsController } from './vendors.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor]),
    UsersModule,
  ],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}
