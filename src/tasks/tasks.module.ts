import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { ProjectsModule } from '../projects/projects.module';
import { TasksService } from './tasks.service';
import { VendorsModule } from 'src/vendors/vendors.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'tasks',
    }),
    MailModule,
    ProjectsModule,
    VendorsModule
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
