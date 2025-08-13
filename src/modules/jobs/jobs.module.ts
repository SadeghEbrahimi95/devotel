import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobService } from './services/job.service';
import { JobFetcherService } from './services/job-fetcher.service';
import { JobTransformerService } from './services/job-transformer.service';
import { Job } from './entities/job.entity';
import { SchedulerModule } from '../scheduler/scheduler.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job]),
    SchedulerModule,
  ],
  controllers: [JobsController],
  providers: [
    JobService,
    JobFetcherService,
    JobTransformerService,
  ],
  exports: [JobService],
})
export class JobsModule {}