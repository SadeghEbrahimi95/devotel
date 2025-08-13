# Job Data Integration Backend

A scalable NestJS backend application that aggregates job data from multiple APIs, transforms them into a unified structure, and provides a REST API with filtering and pagination capabilities.

## 🚀 Features

- **Multi-API Integration**: Fetches job data from two different API providers with distinct data structures
- **Data Transformation**: Unified data structure with extensible transformer pattern
- **Duplicate Prevention**: Composite unique constraints and upsert operations
- **Scheduled Jobs**: Configurable cron jobs for automatic data fetching
- **REST API**: Comprehensive filtering, pagination, and sorting
- **TypeScript**: Full type safety and modern development practices
- **Testing**: Unit and integration tests with comprehensive coverage
- **Documentation**: Swagger/OpenAPI documentation
- **Error Handling**: Robust error handling with retry logic
- **Monitoring**: Structured logging and health checks

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Docker and Docker Compose (optional but recommended)

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
# Create the project directory
mkdir job-data-backend
cd job-data-backend

# Initialize NestJS project
npm i -g @nestjs/cli
nest new . --skip-git

# Install dependencies
npm install @nestjs/typeorm @nestjs/config @nestjs/schedule @nestjs/swagger
npm install typeorm pg class-validator class-transformer axios
npm install --save-dev @types/node @types/pg jest @types/jest ts-jest supertest @types/supertest
```

### 2. Environment Setup

Create `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=jobuser
DB_PASSWORD=jobpass
DB_DATABASE=jobsdb

# API Configuration
API_PROVIDER1_URL=https://assignment.devotel.io/api/provider1/jobs
API_PROVIDER2_URL=https://assignment.devotel.io/api/provider2/jobs

# Scheduler
FETCH_JOBS_CRON=0 */6 * * *
SCHEDULER_ENABLED=true

# Application
PORT=3000
NODE_ENV=development
```

### 3. Database Setup

Using Docker (Recommended):

```bash
# Start PostgreSQL
docker-compose up -d postgres
```

Or install PostgreSQL locally and create database:

```sql
CREATE DATABASE jobsdb;
CREATE USER jobuser WITH PASSWORD 'jobpass';
GRANT ALL PRIVILEGES ON DATABASE jobsdb TO jobuser;
```

### 4. Run the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will be available at:
- API: http://localhost:3000
- Documentation: http://localhost:3000/api/docs

## 📖 API Documentation

### Endpoints

#### GET /api/job-offers

Retrieve paginated job offers with optional filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `title` (string): Filter by job title (case-insensitive)
- `location` (string): Filter by location
- `minSalary` (number): Minimum salary filter
- `maxSalary` (number): Maximum salary filter
- `company` (string): Filter by company name
- `skills` (string): Comma-separated skills
- `jobType` (string): Filter by job type
- `remote` (boolean): Filter by remote availability
- `sortBy` (string): Sort field (postedDate, salaryMin, salaryMax, title, company)
- `sortOrder` (string): Sort order (ASC, DESC)

**Example Requests:**

```bash
# Basic pagination
curl "http://localhost:3000/api/job-offers?page=1&limit=10"

# Filter by title and location
curl "http://localhost:3000/api/job-offers?title=developer&location=austin"

# Filter by salary range
curl "http://localhost:3000/api/job-offers?minSalary=80000&maxSalary=150000"

# Filter by skills
curl "http://localhost:3000/api/job-offers?skills=javascript,react"

# Multiple filters with sorting
curl "http://localhost:3000/api/job-offers?title=frontend&remote=true&sortBy=salaryMax&sortOrder=DESC"
```

#### Other Endpoints

- `GET /api/job-offers/stats` - Get job statistics
- `POST /api/job-offers/fetch` - Manually trigger job fetch
- `GET /api/job-offers/scheduler/status` - Get scheduler status

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 🏗️ Architecture

### Data Flow

1. **Scheduled Fetch**: Cron job triggers data fetching every 6 hours
2. **API Calls**: Fetch data from both providers with retry logic
3. **Transformation**: Convert different structures to unified format
4. **Storage**: Upsert to PostgreSQL with duplicate prevention
5. **API Access**: REST endpoints with filtering and pagination

### Key Components

- **JobTransformerService**: Handles data transformation from different APIs
- **JobFetcherService**: Manages API calls with retry logic
- **JobService**: Main business logic for storing and retrieving jobs
- **SchedulerService**: Manages cron jobs for automatic data fetching
- **JobsController**: REST API endpoints

### Database Schema

The application creates a `jobs` table with the following structure:

```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  company VARCHAR NOT NULL,
  location VARCHAR NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR DEFAULT 'USD',
  job_type VARCHAR,
  skills TEXT[],
  is_remote BOOLEAN DEFAULT false,
  experience_years INTEGER,
  company_website VARCHAR,
  company_industry VARCHAR,
  posted_date TIMESTAMP NOT NULL,
  source VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source, external_id)
);
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | 3000 |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_USERNAME` | Database username | jobuser |
| `DB_PASSWORD` | Database password | jobpass |
| `DB_DATABASE` | Database name | jobsdb |
| `FETCH_JOBS_CRON` | Cron schedule for job fetching | `0 */6 * * *` |
| `SCHEDULER_ENABLED` | Enable/disable scheduler | true |

### Scheduler Configuration

The default cron expression `0 */6 * * *` runs every 6 hours. You can customize it:

- `0 */1 * * *` - Every hour
- `0 0 */4 * * *` - Every 4 hours
- `0 0 0 * * *` - Daily at midnight
- `0 0 0 * * 1` - Weekly on Monday

## 🔄 Adding New APIs

The system is designed to be easily extensible for new job APIs:

1. **Create Transformer**: Implement transformation logic in `JobTransformerService`
2. **Add Configuration**: Add API details to configuration
3. **Update Fetcher**: Add new fetch method to `JobFetcherService`
4. **Update Service**: Add transformation call to `JobService`

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker
docker-compose up -d

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

## 📊 Monitoring and Logging

The application provides:

- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Error Tracking**: Comprehensive error capture and reporting
- **Health Checks**: Database and external API health monitoring
- **API Documentation**: Interactive Swagger UI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For questions or issues:
- Check the API documentation at `/api/docs`
- Review the logs for error details
- Ensure database connectivity and API availability

## 🎯 Assignment Requirements Fulfilled

✅ **Data Transformation**: Both API providers integrated with unified structure  
✅ **Scheduled Fetching**: Configurable cron jobs every 6 hours  
✅ **Database Storage**: PostgreSQL with duplicate prevention  
✅ **API Development**: Filtering, pagination, error handling  
✅ **TypeScript**: Full type safety throughout  
✅ **NestJS**: Modern framework with dependency injection  
✅ **Testing**: Comprehensive unit and integration tests  
✅ **Error Handling**: Robust error management with retries