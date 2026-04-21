import { HttpClient } from '../client';
import { ABTest, CreateABTestOptions } from '../types';

export class ABTesting {
  constructor(private client: HttpClient) {}

  /**
   * Create a new A/B test.
   */
  async create(options: CreateABTestOptions & { appId: string }): Promise<ABTest> {
    return this.client.post<ABTest>('/ab-tests', options);
  }

  /**
   * List all A/B tests for an app.
   */
  async list(appId: string): Promise<ABTest[]> {
    return this.client.get<ABTest[]>(`/ab-tests/app/${appId}`);
  }

  /**
   * Get an A/B test by ID.
   */
  async get(id: string): Promise<ABTest> {
    return this.client.get<ABTest>(`/ab-tests/${id}`);
  }

  /**
   * Get results for an A/B test.
   */
  async getResults(id: string): Promise<any> {
    return this.client.get<any>(`/ab-tests/${id}/results`);
  }

  /**
   * Start an A/B test.
   */
  async start(id: string): Promise<ABTest> {
    return this.client.post<ABTest>(`/ab-tests/${id}/start`);
  }

  /**
   * Pause an A/B test.
   */
  async pause(id: string): Promise<ABTest> {
    return this.client.post<ABTest>(`/ab-tests/${id}/pause`);
  }

  /**
   * Complete an A/B test.
   */
  async complete(id: string, winnerId?: string): Promise<ABTest> {
    return this.client.post<ABTest>(`/ab-tests/${id}/complete`, winnerId ? { winnerId } : undefined);
  }

  /**
   * Delete an A/B test.
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/ab-tests/${id}`);
  }

  /**
   * Send an A/B test to targeted devices.
   */
  async send(id: string): Promise<{ sent: number }> {
    return this.client.post<{ sent: number }>(`/ab-tests/${id}/send`);
  }

  /**
   * Calculate audience size for targeting options.
   */
  async getAudienceSize(options: {
    appId: string;
    targetType?: string;
    segmentId?: string;
    targetPercentage?: number;
  }): Promise<{ count: number }> {
    return this.client.post<{ count: number }>('/ab-tests/audience-size', options);
  }
}
