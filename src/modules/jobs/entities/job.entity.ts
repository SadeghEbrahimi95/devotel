import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('jobs')
@Index(['title'])
@Index(['location'])
@Index(['salaryMin', 'salaryMax'])
@Index(['company'])
@Index(['postedDate'])
@Index(['source', 'externalId'], { unique: true })
export class Job {
  @PrimaryColumn('uuid', { generated: 'uuid' })
  id: string;

  @Column({ name: 'external_id' })
  externalId: string;

  @Column()
  @Index()
  title: string;

  @Column()
  @Index()
  company: string;

  @Column()
  @Index()
  location: string;

  @Column({ name: 'salary_min', type: 'integer', nullable: true })
  @Index()
  salaryMin: number;

  @Column({ name: 'salary_max', type: 'integer', nullable: true })
  @Index()
  salaryMax: number;

  @Column({ name: 'salary_currency', default: 'USD' })
  salaryCurrency: string;

  @Column({ name: 'job_type', nullable: true })
  jobType: string;

  @Column('text', { array: true, default: '{}' })
  skills: string[];

  @Column({ name: 'is_remote', default: false })
  isRemote: boolean;

  @Column({ name: 'experience_years', type: 'integer', nullable: true })
  experienceYears: number;

  @Column({ name: 'company_website', nullable: true })
  companyWebsite: string;

  @Column({ name: 'company_industry', nullable: true })
  companyIndustry: string;

  @Column({ name: 'posted_date', type: 'timestamp' })
  @Index()
  postedDate: Date;

  @Column()
  @Index()
  source: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}