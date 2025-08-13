import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class JobFetcherService {
  private readonly logger = new Logger(JobFetcherService.name);
  private readonly httpClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Job-Data-Backend/1.0.0'
      }
    });

    // Add response interceptor for logging
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`HTTP ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error(`HTTP Error: ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Fetch jobs from Provider 1 API with retry logic
   */
  async fetchFromProvider1(): Promise<any> {
    const url = this.configService.get<string>('apis.provider1.url');
    const retries = this.configService.get<number>('apis.provider1.retries', 3);
    
    return this.fetchWithRetry(url, retries, 'Provider 1');
  }

  /**
   * Fetch jobs from Provider 2 API with retry logic
   */
  async fetchFromProvider2(): Promise<any> {
    const url = this.configService.get<string>('apis.provider2.url');
    const retries = this.configService.get<number>('apis.provider2.retries', 3);
    
    return this.fetchWithRetry(url, retries, 'Provider 2');
  }

  /**
   * Generic fetch method with exponential backoff retry logic
   */
  private async fetchWithRetry(url: string, maxRetries: number, providerName: string): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Fetching data from ${providerName} (attempt ${attempt}/${maxRetries})`);
        
        const response = await this.httpClient.get(url);
        
        this.logger.log(`Successfully fetched data from ${providerName}`);
        return response.data;
        
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        
        if (error.response) {
          this.logger.error(
            `${providerName} HTTP ${error.response.status}: ${error.response.statusText} (attempt ${attempt}/${maxRetries})`
          );
        } else if (error.request) {
          this.logger.error(
            `${providerName} network error: ${error.message} (attempt ${attempt}/${maxRetries})`
          );
        } else {
          this.logger.error(
            `${providerName} error: ${error.message} (attempt ${attempt}/${maxRetries})`
          );
        }

        if (isLastAttempt) {
          throw new Error(`Failed to fetch from ${providerName} after ${maxRetries} attempts: ${error.message}`);
        }

        // Exponential backoff: wait 2^attempt seconds
        const delayMs = Math.pow(2, attempt) * 1000;
        this.logger.debug(`Waiting ${delayMs}ms before retry...`);
        await this.delay(delayMs);
      }
    }
  }

  /**
   * Utility method to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}