import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { JobService } from '../jobs/services/job.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private isJobRunning = false;

  constructor(
    private configService: ConfigService,
    private jobService: JobService,
  ) {}

  @Cron('0 */6 * * *') // Every 6 hours by default
  async handleJobFetchCron() {
    const isEnabled = this.configService.get<boolean>('scheduler.enabled', true);
    
    if (!isEnabled) {
      this.logger.debug('Scheduler is disabled');
      return;
    }

    if (this.isJobRunning) {
      this.logger.warn('Job fetch is already running, skipping this execution');
      return;
    }

    this.isJobRunning = true;
    const startTime = Date.now();

    try {
      this.logger.log('Starting scheduled job fetch');
      
      const result = await this.jobService.fetchAndStoreJobs();
      
      const duration = Date.now() - startTime;
      this.logger.log(
        `Scheduled job fetch completed in ${duration}ms. ` +
        `Fetched: ${result.totalFetched}, Stored: ${result.totalStored}`
      );
      
    } catch (error) {
      this.logger.error('Scheduled job fetch failed:', error);
    } finally {
      this.isJobRunning = false;
    }
  }

  /**
   * Manually trigger job fetch (useful for testing)
   */
  async triggerJobFetch(): Promise<{ totalFetched: number; totalStored: number }> {
    if (this.isJobRunning) {
      throw new Error('Job fetch is already running');
    }

    this.logger.log('Manually triggering job fetch');
    return await this.jobService.fetchAndStoreJobs();
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; enabled: boolean; cronExpression: string } {
    return {
      isRunning: this.isJobRunning,
      enabled: this.configService.get<boolean>('scheduler.enabled', true),
      cronExpression: this.configService.get<string>('scheduler.fetchJobsCron', '0 */6 * * *'),
    };
  }
}