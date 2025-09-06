import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import type { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ProjectsService } from '../projects/projects.service';
import { VendorsService } from 'src/vendors/vendors.service';

@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectQueue('tasks') private tasksQueue: Queue,
    private readonly projectsService: ProjectsService,
    private readonly vendorsService: VendorsService,
    private readonly configService: ConfigService,

  ) { }

  onModuleInit() {
  }

  @Cron(process.env.MATCH_REFRESH_CRON || '*/1 * * * *')
  async handleCronRefreshMatches() {
    this.logger.log('Running scheduled job: refresh-matches');
    await this.refreshAllActiveProjects();
  }

  @Cron(process.env.SLA_CHECK_CRON || '*/1 * * * *')
  async handleCronCheckSla() {
    this.logger.log('Running scheduled job: check-sla-expiration');
    await this.checkSlaExpirations();
  }

  /**
   * Refresh matches for all active projects
   */
  async refreshAllActiveProjects() {
    try {
      // Get all active projects with required relations
      const activeProjects = await this.projectsService.findActive(['client', 'client.user']);

      // Process each project sequentially to avoid overwhelming the system
      for (const project of activeProjects) {
        try {
          this.logger.log(`Refreshing matches for project: ${project.id}`);
          await this.projectsService.rebuildVendorMatches(project);
          this.logger.log(`Successfully refreshed matches for project: ${project.id}`);
        } catch (error) {
          // Log error but continue with other projects
          this.logger.error(
            `Failed to refresh matches for project ${project.id}: ${error.message}`,
            error.stack
          );
        }
      }

      this.logger.log(`Completed refreshing matches for ${activeProjects.length} active projects`);
      return { success: true, processed: activeProjects.length };
    } catch (error) {
      this.logger.error(`Error in refreshAllActiveProjects: ${error.message}`, error.stack);
      throw error;
    }
  }

  async checkSlaExpirations() {
    try {
      // Queue the SLA expiration check job
      // await this.tasksQueue.add('check-sla-expiration', {});
      this.logger.log('Queued SLA expiration check job');
      const soonToExpireVendors = await this.vendorsService.getVendorsWithExpiredSLAs();

      await Promise.allSettled(soonToExpireVendors.map(vendor =>
        this.vendorsService.update(vendor.id, { status: 'SLA_EXPIRED' })));


    } catch (error) {
      this.logger.error(`Error in checkSlaExpirations: ${error.message}`, error.stack);
      throw error;
    }
  }



  // Manually trigger match refresh for a specific project
  // async triggerMatchRefresh(projectId: string) {
  //   try {
  //     await this.tasksQueue.add('refresh-matches', { projectId });
  //     return { success: true, message: 'Match refresh job queued' };
  //   } catch (error) {
  //     this.logger.error(`Error triggering match refresh for project ${projectId}:`, error);
  //     throw error;
  //   }
  // }
}
