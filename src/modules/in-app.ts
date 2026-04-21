import { HttpClient } from '../client';
import { InAppMessage, CreateInAppOptions, UpdateInAppOptions } from '../types';

export class InApp {
  constructor(private client: HttpClient) {}

  /**
   * Create a new in-app message.
   */
  async create(appId: string, options: CreateInAppOptions): Promise<InAppMessage> {
    return this.client.post<InAppMessage>('/in-app', options, { appId });
  }

  /**
   * List all in-app messages.
   */
  async list(appId: string): Promise<InAppMessage[]> {
    return this.client.get<InAppMessage[]>('/in-app', { appId });
  }

  /**
   * Get an in-app message by ID.
   */
  async get(appId: string, id: string): Promise<InAppMessage> {
    return this.client.get<InAppMessage>(`/in-app/${id}`, { appId });
  }

  /**
   * Update an in-app message.
   */
  async update(appId: string, id: string, options: UpdateInAppOptions): Promise<InAppMessage> {
    return this.client.put<InAppMessage>(`/in-app/${id}`, options, { appId });
  }

  /**
   * Delete an in-app message.
   */
  async delete(appId: string, id: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/in-app/${id}`, undefined, { appId });
  }

  /**
   * Activate an in-app message.
   */
  async activate(appId: string, id: string): Promise<InAppMessage> {
    return this.client.post<InAppMessage>(`/in-app/${id}/activate`, undefined, { appId });
  }

  /**
   * Pause an in-app message.
   */
  async pause(appId: string, id: string): Promise<InAppMessage> {
    return this.client.post<InAppMessage>(`/in-app/${id}/pause`, undefined, { appId });
  }

  /**
   * Duplicate an in-app message.
   */
  async duplicate(appId: string, id: string): Promise<InAppMessage> {
    return this.client.post<InAppMessage>(`/in-app/${id}/duplicate`, undefined, { appId });
  }

  /**
   * Get analytics for an in-app message.
   */
  async getAnalytics(appId: string, id: string): Promise<any> {
    return this.client.get<any>(`/in-app/${id}/analytics`, { appId });
  }
}
