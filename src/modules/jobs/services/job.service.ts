import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Job } from '../entities/job.entity';
import { JobFetcherService } from './job-fetcher.service';
import { JobTransformerService } from './job-transformer.service';
import { QueryJobsDto } from '../dto/query-jobs.dto';
import { PaginatedJobsDto, PaginationMetaDto } from '../dto/paginated-jobs.dto';
import { UnifiedJob } from '../interfaces/job-api.interface';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private jobFetcherService: JobFetcherService,
    private jobTransformerService: JobTransformerService,
  ) {}

  /**
   * Fetch and store jobs from all providers
   */
  async fetchAndStoreJobs(): Promise<{ totalFetched: number; totalStored: number }> {
    this.logger.log('Starting scheduled job fetch from all providers');
    
    let totalFetched = 0;
    let totalStored = 0;

    try {
      // Fetch from Provider 1
      try {
        const provider1Data = await this.jobFetcherService.fetchFromProvider1();
        const provider1Jobs = this.jobTransformerService.transformProvider1(provider1Data);
        totalFetched += provider1Jobs.length;
        
        const stored1 = await this.storeJobs(provider1Jobs);
        totalStored += stored1;
        
        this.logger.log(`Provider 1: fetched ${provider1Jobs.length}, stored ${stored1} jobs`);
      } catch (error) {
        this.logger.error('Failed to process Provider 1 jobs:', error.message);
      }

      // Fetch from Provider 2
      try {
        const provider2Data = await this.jobFetcherService.fetchFromProvider2();
        const provider2Jobs = this.jobTransformerService.transformProvider2(provider2Data);
        totalFetched += provider2Jobs.length;
        
        const stored2 = await this.storeJobs(provider2Jobs);
        totalStored += stored2;
        
        this.logger.log(`Provider 2: fetched ${provider2Jobs.length}, stored ${stored2} jobs`);
      } catch (error) {
        this.logger.error('Failed to process Provider 2 jobs:', error.message);
      }

      this.logger.log(`Job fetch completed: ${totalStored}/${totalFetched} jobs stored`);
      
      return { totalFetched, totalStored };
      
    } catch (error) {
      this.logger.error('Critical error in fetchAndStoreJobs:', error);
      throw error;
    }
  }

  /**
   * Store jobs in database with duplicate prevention
   */
  private async storeJobs(jobs: UnifiedJob[]): Promise<number> {
    if (!jobs || jobs.length === 0) {
      return 0;
    }

    try {
      let storedCount = 0;

      for (const jobData of jobs) {
        try {
          await this.jobRepository.upsert(
            {
              externalId: jobData.externalId,
              title: jobData.title,
              company: jobData.company,
              location: jobData.location,
              salaryMin: jobData.salaryMin,
              salaryMax: jobData.salaryMax,
              salaryCurrency: jobData.salaryCurrency,
              jobType: jobData.jobType,
              skills: jobData.skills,
              isRemote: jobData.isRemote,
              experienceYears: jobData.experienceYears,
              companyWebsite: jobData.companyWebsite,
              companyIndustry: jobData.companyIndustry,
              postedDate: jobData.postedDate,
              source: jobData.source,
            },
            {
              conflictPaths: ['source', 'externalId'],
              skipUpdateIfNoValuesChanged: true,
            }
          );
          storedCount++;
        } catch (error) {
          this.logger.warn(`Failed to store job ${jobData.externalId}:`, error.message);
        }
      }

      return storedCount;
    } catch (error) {
      this.logger.error('Error storing jobs:', error);
      throw error;
    }
  }

  /**
   * Find jobs with filtering and pagination
   */
  async findJobs(queryDto: QueryJobsDto): Promise<PaginatedJobsDto> {
    const { page, limit, sortBy, sortOrder, ...filters } = queryDto;
    
    const queryBuilder = this.createQueryBuilder(filters);
    
    // Apply sorting
    if (sortBy) {
      queryBuilder.orderBy(`job.${sortBy}`, sortOrder);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Execute query
    const [jobs, total] = await queryBuilder.getManyAndCount();

    // Create pagination metadata
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMetaDto = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    return {
      data: jobs.map(job => this.transformJobToDto(job)),
      pagination,
    };
  }

  /**
   * Create query builder with filters
   */
  private createQueryBuilder(filters: Partial<QueryJobsDto>): SelectQueryBuilder<Job> {
    const queryBuilder = this.jobRepository.createQueryBuilder('job');

    if (filters.title) {
      queryBuilder.andWhere('LOWER(job.title) LIKE LOWER(:title)', {
        title: `%${filters.title}%`,
      });
    }

    if (filters.location) {
      queryBuilder.andWhere('LOWER(job.location) LIKE LOWER(:location)', {
        location: `%${filters.location}%`,
      });
    }

    if (filters.company) {
      queryBuilder.andWhere('LOWER(job.company) LIKE LOWER(:company)', {
        company: `%${filters.company}%`,
      });
    }

    if (filters.minSalary !== undefined) {
      queryBuilder.andWhere('job.salaryMin >= :minSalary', {
        minSalary: filters.minSalary,
      });
    }

    if (filters.maxSalary !== undefined) {
      queryBuilder.andWhere('job.salaryMax <= :maxSalary', {
        maxSalary: filters.maxSalary,
      });
    }

    if (filters.jobType) {
      queryBuilder.andWhere('LOWER(job.jobType) = LOWER(:jobType)', {
        jobType: filters.jobType,
      });
    }

    if (filters.remote !== undefined) {
      queryBuilder.andWhere('job.isRemote = :remote', {
        remote: filters.remote,
      });
    }

    if (filters.skills) {
      const skillsArray = filters.skills.split(',').map(s => s.trim().toLowerCase());
      queryBuilder.andWhere('LOWER(job.skills::text) LIKE ANY(:skills)', {
        skills: skillsArray.map(skill => `%${skill}%`),
      });
    }

    if (filters.minExperience !== undefined) {
      queryBuilder.andWhere('job.experienceYears >= :minExperience', {
        minExperience: filters.minExperience,
      });
    }

    if (filters.maxExperience !== undefined) {
      queryBuilder.andWhere('job.experienceYears <= :maxExperience', {
        maxExperience: filters.maxExperience,
      });
    }

    return queryBuilder;
  }

  /**
   * Transform Job entity to DTO
   */
  private transformJobToDto(job: Job): any {
    return {
      id: job.id,
      externalId: job.externalId,
      title: job.title,
      company: job.company,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      jobType: job.jobType,
      skills: job.skills,
      isRemote: job.isRemote,
      experienceYears: job.experienceYears,
      companyWebsite: job.companyWebsite,
      companyIndustry: job.companyIndustry,
      postedDate: job.postedDate.toISOString(),
      source: job.source,
    };
  }

  /**
   * Get job statistics
   */
  async getJobStats(): Promise<any> {
    const total = await this.jobRepository.count();
    const bySource = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .groupBy('job.source')
      .getRawMany();

    const recentCount = await this.jobRepository
      .createQueryBuilder('job')
      .where('job.postedDate >= :date', { 
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      })
      .getCount();

    return {
      total,
      bySource,
      recentCount,
      lastUpdated: new Date().toISOString(),
    };
  }
}