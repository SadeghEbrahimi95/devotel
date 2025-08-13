import { Test, TestingModule } from '@nestjs/testing';
import { JobTransformerService } from './job-transformer.service';
import { ApiProvider1Response, ApiProvider2Response } from '../interfaces/job-api.interface';

describe('JobTransformerService', () => {
  let service: JobTransformerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobTransformerService],
    }).compile();

    service = module.get<JobTransformerService>(JobTransformerService);
  });

  describe('transformProvider1', () => {
    it('should transform Provider 1 data correctly', () => {
      const mockData: ApiProvider1Response = {
        metadata: {
          requestId: 'test-123',
          timestamp: '2025-08-11T08:00:00.000Z'
        },
        jobs: [
          {
            jobId: 'P1-123',
            title: 'Software Engineer',
            details: {
              location: 'San Francisco, CA',
              type: 'Full-Time',
              salaryRange: '$100k - $150k'
            },
            company: {
              name: 'TechCorp',
              industry: 'Technology'
            },
            skills: ['JavaScript', 'React', 'Node.js'],
            postedDate: '2025-08-01T10:00:00.000Z'
          }
        ]
      };

      const result = service.transformProvider1(mockData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        externalId: 'P1-123',
        title: 'Software Engineer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        salaryMin: 100000,
        salaryMax: 150000,
        salaryCurrency: 'USD',
        jobType: 'Full-Time',
        skills: ['JavaScript', 'React', 'Node.js'],
        isRemote: false,
        experienceYears: null,
        companyWebsite: null,
        companyIndustry: 'Technology',
        postedDate: new Date('2025-08-01T10:00:00.000Z'),
        source: 'provider1'
      });
    });

    it('should handle invalid data gracefully', () => {
      const invalidData = { invalid: 'data' } as any;
      const result = service.transformProvider1(invalidData);
      expect(result).toEqual([]);
    });

    it('should detect remote locations', () => {
      const mockData: ApiProvider1Response = {
        metadata: { requestId: 'test', timestamp: '2025-08-11T08:00:00.000Z' },
        jobs: [{
          jobId: 'P1-remote',
          title: 'Remote Developer',
          details: {
            location: 'Remote, Anywhere',
            type: 'Full-Time',
            salaryRange: '$80k - $120k'
          },
          company: { name: 'RemoteCorp', industry: 'Tech' },
          skills: ['Python'],
          postedDate: '2025-08-01T10:00:00.000Z'
        }]
      };

      const result = service.transformProvider1(mockData);
      expect(result[0].isRemote).toBe(true);
    });
  });

  describe('transformProvider2', () => {
    it('should transform Provider 2 data correctly', () => {
      const mockData: ApiProvider2Response = {
        status: 'success',
        data: {
          jobsList: {
            'job-456': {
              position: 'Backend Engineer',
              location: {
                city: 'Austin',
                state: 'TX',
                remote: false
              },
              compensation: {
                min: 90000,
                max: 140000,
                currency: 'USD'
              },
              employer: {
                companyName: 'StartupCorp',
                website: 'https://startupcorp.com'
              },
              requirements: {
                experience: 3,
                technologies: ['Java', 'Spring', 'PostgreSQL']
              },
              datePosted: '2025-08-02'
            }
          }
        }
      };

      const result = service.transformProvider2(mockData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        externalId: 'job-456',
        title: 'Backend Engineer',
        company: 'StartupCorp',
        location: 'Austin, TX',
        salaryMin: 90000,
        salaryMax: 140000,
        salaryCurrency: 'USD',
        jobType: null,
        skills: ['Java', 'Spring', 'PostgreSQL'],
        isRemote: false,
        experienceYears: 3,
        companyWebsite: 'https://startupcorp.com',
        companyIndustry: null,
        postedDate: new Date('2025-08-02'),
        source: 'provider2'
      });
    });

    it('should handle remote jobs from Provider 2', () => {
      const mockData: ApiProvider2Response = {
        status: 'success',
        data: {
          jobsList: {
            'job-remote': {
              position: 'Frontend Developer',
              location: { city: 'New York', state: 'NY', remote: true },
              compensation: { min: 70000, max: 110000, currency: 'USD' },
              employer: { companyName: 'RemoteFirst' },
              requirements: { experience: 2, technologies: ['React'] },
              datePosted: '2025-08-03'
            }
          }
        }
      };

      const result = service.transformProvider2(mockData);
      expect(result[0].isRemote).toBe(true);
    });
  });
});