import { HttpClient } from '../client';
import { AnalyticsOverview, DailyStats, AppStats } from '../types';

export class Analytics {
  constructor(private client: HttpClient) {}

  /**
   * Get analytics overview.
   */
  async getOverview(): Promise<AnalyticsOverview> {
    return this.client.get<AnalyticsOverview>('/analytics/overview');
  }

  /**
   * Get daily analytics.
   */
  async getDaily(days?: number): Promise<DailyStats[]> {
    return this.client.get<DailyStats[]>('/analytics/daily', { days });
  }

  /**
   * Get message type distribution.
   */
  async getMessageTypes(): Promise<{ type: string; count: number }[]> {
    return this.client.get<{ type: string; count: number }[]>('/analytics/message-types');
  }

  /**
   * Get hourly distribution.
   */
  async getHourly(days?: number): Promise<{ hour: number; count: number }[]> {
    return this.client.get<{ hour: number; count: number }[]>('/analytics/hourly', { days });
  }

  /**
   * Get recent messages.
   */
  async getRecent(limit?: number): Promise<any[]> {
    return this.client.get<any[]>('/analytics/recent', { limit });
  }

  /**
   * Get app stats (devices, topics, etc.).
   */
  async getStats(): Promise<AppStats> {
    return this.client.get<AppStats>('/stats');
  }
}
