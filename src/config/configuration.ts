export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'jobuser',
    password: process.env.DB_PASSWORD || 'jobpass',
    database: process.env.DB_DATABASE || 'jobsdb',
  },
  apis: {
    provider1: {
      url: process.env.API_PROVIDER1_URL || 'https://assignment.devotel.io/api/provider1/jobs',
      timeout: parseInt(process.env.API_PROVIDER1_TIMEOUT, 10) || 10000,
      retries: parseInt(process.env.API_PROVIDER1_RETRIES, 10) || 3,
    },
    provider2: {
      url: process.env.API_PROVIDER2_URL || 'https://assignment.devotel.io/api/provider2/jobs',
      timeout: parseInt(process.env.API_PROVIDER2_TIMEOUT, 10) || 10000,
      retries: parseInt(process.env.API_PROVIDER2_RETRIES, 10) || 3,
    },
  },
  scheduler: {
    fetchJobsCron: process.env.FETCH_JOBS_CRON || '0 */6 * * *', // Every 6 hours
    enabled: process.env.SCHEDULER_ENABLED !== 'false',
  },
  pagination: {
    defaultLimit: parseInt(process.env.DEFAULT_PAGE_LIMIT, 10) || 10,
    maxLimit: parseInt(process.env.MAX_PAGE_LIMIT, 10) || 100,
  },
});