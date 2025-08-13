import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsBoolean, Min, Max, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryJobsDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Filter by job title (case-insensitive)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Filter by location (case-insensitive)' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Minimum salary filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @ApiPropertyOptional({ description: 'Maximum salary filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxSalary?: number;

  @ApiPropertyOptional({ description: 'Filter by company name (case-insensitive)' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Comma-separated skills to filter by' })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by job type', 
    enum: ['Full-Time', 'Part-Time', 'Contract', 'Freelance', 'Internship'] 
  })
  @IsOptional()
  @IsString()
  jobType?: string;

  @ApiPropertyOptional({ description: 'Filter by remote availability' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  remote?: boolean;

  @ApiPropertyOptional({ description: 'Minimum years of experience' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minExperience?: number;

  @ApiPropertyOptional({ description: 'Maximum years of experience' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxExperience?: number;

  @ApiPropertyOptional({ 
    description: 'Sort by field', 
    enum: ['postedDate', 'salaryMin', 'salaryMax', 'title', 'company'] 
  })
  @IsOptional()
  @IsString()
  @IsIn(['postedDate', 'salaryMin', 'salaryMax', 'title', 'company'])
  sortBy?: string = 'postedDate';

  @ApiPropertyOptional({ 
    description: 'Sort order', 
    enum: ['ASC', 'DESC'] 
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}