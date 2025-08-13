import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsISO8601, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JobDto {
  @ApiProperty({ description: 'Unique job identifier' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'External job ID from source API' })
  @IsString()
  externalId: string;

  @ApiProperty({ description: 'Job title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Company name' })
  @IsString()
  company: string;

  @ApiProperty({ description: 'Job location' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ description: 'Minimum salary' })
  @IsOptional()
  @IsNumber()
  salaryMin?: number;

  @ApiPropertyOptional({ description: 'Maximum salary' })
  @IsOptional()
  @IsNumber()
  salaryMax?: number;

  @ApiProperty({ description: 'Salary currency', default: 'USD' })
  @IsString()
  salaryCurrency: string;

  @ApiPropertyOptional({ description: 'Job type (Full-Time, Contract, etc.)' })
  @IsOptional()
  @IsString()
  jobType?: string;

  @ApiProperty({ description: 'Required skills', type: [String] })
  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @ApiProperty({ description: 'Remote work availability' })
  @IsBoolean()
  isRemote: boolean;

  @ApiPropertyOptional({ description: 'Required years of experience' })
  @IsOptional()
  @IsNumber()
  experienceYears?: number;

  @ApiPropertyOptional({ description: 'Company website' })
  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @ApiPropertyOptional({ description: 'Company industry' })
  @IsOptional()
  @IsString()
  companyIndustry?: string;

  @ApiProperty({ description: 'Job posting date' })
  @IsISO8601()
  postedDate: string;

  @ApiProperty({ description: 'Source API provider' })
  @IsString()
  source: string;
}