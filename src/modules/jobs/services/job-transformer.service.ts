import { Injectable, Logger } from '@nestjs/common';
import { 
  JobTransformer, 
  UnifiedJob, 
  ApiProvider1Response, 
  ApiProvider2Response 
} from '../interfaces/job-api.interface';

@Injectable()
export class JobTransformerService {
  private readonly logger = new Logger(JobTransformerService.name);

  /**
   * Transform API Provider 1 data to unified format
   */
  transformProvider1(data: ApiProvider1Response): UnifiedJob[] {
    try {
      if (!data?.jobs || !Array.isArray(data.jobs)) {
        this.logger.warn('Invalid or empty jobs data from Provider 1');
        return [];
      }

      return data.jobs.map(job => {
        const salaryRange = this.parseSalaryRange(job.details.salaryRange);
        
        return {
          externalId: job.jobId,
          title: job.title,
          company: job.company.name,
          location: job.details.location,
          salaryMin: salaryRange.min,
          salaryMax: salaryRange.max,
          salaryCurrency: salaryRange.currency,
          jobType: job.details.type,
          skills: job.skills || [],
          isRemote: this.isRemoteLocation(job.details.location),
          experienceYears: null,
          companyWebsite: null,
          companyIndustry: job.company.industry,
          postedDate: new Date(job.postedDate),
          source: 'provider1'
        };
      });
    } catch (error) {
      this.logger.error('Error transforming Provider 1 data:', error);
      return [];
    }
  }

  /**
   * Transform API Provider 2 data to unified format
   */
  transformProvider2(data: ApiProvider2Response): UnifiedJob[] {
    try {
      if (!data?.data?.jobsList) {
        this.logger.warn('Invalid or empty jobs data from Provider 2');
        return [];
      }

      const jobs = [];
      for (const [jobId, job] of Object.entries(data.data.jobsList)) {
        jobs.push({
          externalId: jobId,
          title: job.position,
          company: job.employer.companyName,
          location: `${job.location.city}, ${job.location.state}`,
          salaryMin: job.compensation.min,
          salaryMax: job.compensation.max,
          salaryCurrency: job.compensation.currency,
          jobType: null, // Not provided in this API
          skills: job.requirements.technologies || [],
          isRemote: job.location.remote,
          experienceYears: job.requirements.experience,
          companyWebsite: job.employer.website,
          companyIndustry: null, // Not provided in this API
          postedDate: new Date(job.datePosted),
          source: 'provider2'
        });
      }

      return jobs;
    } catch (error) {
      this.logger.error('Error transforming Provider 2 data:', error);
      return [];
    }
  }

  /**
   * Parse salary range string like "$89k - $147k" to min/max numbers
   */
  private parseSalaryRange(salaryRange: string): { min: number; max: number; currency: string } {
    try {
      // Match patterns like "$89k - $147k" or "$89,000 - $147,000"
      const regex = /\$?(\d+(?:,\d{3})*(?:\.\d{2})?)[kK]?\s*-\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)[kK]?/;
      const match = salaryRange.match(regex);

      if (!match) {
        this.logger.warn(`Could not parse salary range: ${salaryRange}`);
        return { min: null, max: null, currency: 'USD' };
      }

      let min = parseFloat(match[1].replace(/,/g, ''));
      let max = parseFloat(match[2].replace(/,/g, ''));

      // Handle 'k' suffix (thousands)
      if (salaryRange.toLowerCase().includes('k')) {
        min *= 1000;
        max *= 1000;
      }

      return {
        min: Math.round(min),
        max: Math.round(max),
        currency: 'USD'
      };
    } catch (error) {
      this.logger.error(`Error parsing salary range "${salaryRange}":`, error);
      return { min: null, max: null, currency: 'USD' };
    }
  }

  /**
   * Determine if location indicates remote work
   */
  private isRemoteLocation(location: string): boolean {
    const remoteKeywords = ['remote', 'anywhere', 'work from home', 'wfh'];
    return remoteKeywords.some(keyword => 
      location.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}