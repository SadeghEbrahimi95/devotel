export interface JobTransformer {
  transform(data: any): UnifiedJob[];
}

export interface UnifiedJob {
  externalId: string;
  title: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  jobType?: string;
  skills: string[];
  isRemote: boolean;
  experienceYears?: number;
  companyWebsite?: string;
  companyIndustry?: string;
  postedDate: Date;
  source: string;
}

export interface ApiProvider1Job {
  jobId: string;
  title: string;
  details: {
    location: string;
    type: string;
    salaryRange: string;
  };
  company: {
    name: string;
    industry: string;
  };
  skills: string[];
  postedDate: string;
}

export interface ApiProvider1Response {
  metadata: {
    requestId: string;
    timestamp: string;
  };
  jobs: ApiProvider1Job[];
}

export interface ApiProvider2Job {
  position: string;
  location: {
    city: string;
    state: string;
    remote: boolean;
  };
  compensation: {
    min: number;
    max: number;
    currency: string;
  };
  employer: {
    companyName: string;
    website?: string;
  };
  requirements: {
    experience: number;
    technologies: string[];
  };
  datePosted: string;
}

export interface ApiProvider2Response {
  status: string;
  data: {
    jobsList: {
      [key: string]: ApiProvider2Job;
    };
  };
}