import { HttpClient } from '../client';
import { ScheduledMessage, CreateScheduledOptions, UpdateScheduledOptions } from '../types';

export class Scheduled {
  constructor(private client: HttpClient) {}

  /**
   * Schedule a new message.
   */
  async create(options: CreateScheduledOptions): Promise<ScheduledMessage> {
    return this.client.post<ScheduledMessage>('/scheduled', options);
  }

  /**
   * List all scheduled messages.
   */
  async list(): Promise<ScheduledMessage[]> {
    return this.client.get<ScheduledMessage[]>('/scheduled');
  }

  /**
   * List pending scheduled messages.
   */
  async listPending(): Promise<ScheduledMessage[]> {
    return this.client.get<ScheduledMessage[]>('/scheduled/pending');
  }

  /**
   * Get a scheduled message by ID.
   */
  async get(id: string): Promise<ScheduledMessage> {
    return this.client.get<ScheduledMessage>(`/scheduled/${id}`);
  }

  /**
   * Update a scheduled message.
   */
  async update(id: string, options: UpdateScheduledOptions): Promise<ScheduledMessage> {
    return this.client.put<ScheduledMessage>(`/scheduled/${id}`, options);
  }

  /**
   * Cancel a scheduled message.
   */
  async cancel(id: string): Promise<ScheduledMessage> {
    return this.client.post<ScheduledMessage>(`/scheduled/${id}/cancel`);
  }

  /**
   * Delete a scheduled message.
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/scheduled/${id}`);
  }
}
