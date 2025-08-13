import { 
  Controller, 
  Get, 
  Query, 
  Post, 
  HttpException, 
  HttpStatus,
  UseInterceptors,
  Logger
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { JobService } from './services/job.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { PaginatedJobsDto } from './dto/paginated-jobs.dto';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';

@ApiTags('Jobs')
@Controller('api/job-offers')
@UseInterceptors(LoggingInterceptor)
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(
    private readonly jobService: JobService,
    private readonly schedulerService: SchedulerService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Retrieve job offers',
    description: 'Get paginated job offers with optional filtering by title, location, salary, skills, etc.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved job offers',
    type: PaginatedJobsDto
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async getJobs(@Query() queryDto: QueryJobsDto): Promise<PaginatedJobsDto> {
    try {
      this.logger.log(`Fetching jobs with filters: ${JSON.stringify(queryDto)}`);
      
      const result = await this.jobService.findJobs(queryDto);
      
      this.logger.log(`Retrieved ${result.data.length} jobs (page ${queryDto.page})`);
      
      return result;
    } catch (error) {
      this.logger.error('Error fetching jobs:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to retrieve job offers',
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get job statistics',
    description: 'Retrieve statistics about stored jobs including counts by source and recent jobs'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved job statistics'
  })
  async getJobStats() {
    try {
      const stats = await this.jobService.getJobStats();
      this.logger.log('Retrieved job statistics');
      return stats;
    } catch (error) {
      this.logger.error('Error fetching job stats:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to retrieve job statistics',
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('fetch')
  @ApiOperation({ 
    summary: 'Manually trigger job fetch',
    description: 'Manually trigger fetching jobs from all configured APIs'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully triggered job fetch'
  })
  async triggerJobFetch() {
    try {
      this.logger.log('Manual job fetch triggered');
      
      const result = await this.schedulerService.triggerJobFetch();
      
      this.logger.log(`Manual job fetch completed: ${result.totalStored}/${result.totalFetched} jobs stored`);
      
      return {
        message: 'Job fetch completed successfully',
        result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error in manual job fetch:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to fetch jobs',
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('scheduler/status')
  @ApiOperation({ 
    summary: 'Get scheduler status',
    description: 'Retrieve current status of the job scheduler'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved scheduler status'
  })
  getSchedulerStatus() {
    try {
      const status = this.schedulerService.getStatus();
      this.logger.log('Retrieved scheduler status');
      return status;
    } catch (error) {
      this.logger.error('Error fetching scheduler status:', error);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to retrieve scheduler status',
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}