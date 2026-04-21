import { HttpClient } from '../client';
import { Webhook, CreateWebhookOptions, UpdateWebhookOptions, WebhookEvent } from '../types';

export class Webhooks {
  constructor(private client: HttpClient) {}

  /**
   * Create a new webhook.
   */
  async create(options: CreateWebhookOptions): Promise<Webhook> {
    return this.client.post<Webhook>('/webhooks', options);
  }

  /**
   * List all webhooks.
   */
  async list(): Promise<Webhook[]> {
    return this.client.get<Webhook[]>('/webhooks');
  }

  /**
   * Get available webhook events.
   */
  async getEvents(): Promise<{ value: WebhookEvent; label: string }[]> {
    return this.client.get<{ value: WebhookEvent; label: string }[]>('/webhooks/events');
  }

  /**
   * Get a webhook by ID.
   */
  async get(id: string): Promise<Webhook> {
    return this.client.get<Webhook>(`/webhooks/${id}`);
  }

  /**
   * Update a webhook.
   */
  async update(id: string, options: UpdateWebhookOptions): Promise<Webhook> {
    return this.client.put<Webhook>(`/webhooks/${id}`, options);
  }

  /**
   * Delete a webhook.
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/webhooks/${id}`);
  }

  /**
   * Regenerate webhook secret.
   */
  async regenerateSecret(id: string): Promise<{ secret: string }> {
    return this.client.post<{ secret: string }>(`/webhooks/${id}/regenerate-secret`);
  }

  /**
   * Get webhook delivery logs.
   */
  async getLogs(id: string, limit?: number): Promise<any[]> {
    return this.client.get<any[]>(`/webhooks/${id}/logs`, { limit });
  }

  /**
   * Test a webhook.
   */
  async test(id: string, event?: WebhookEvent): Promise<{ success: boolean; response: any }> {
    return this.client.post<{ success: boolean; response: any }>(`/webhooks/${id}/test`, { event });
  }
}
