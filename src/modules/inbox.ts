import { HttpClient } from '../client';
import {
  InboxMessage,
  SendToUserInboxOptions,
  SendToUsersInboxOptions,
  SendToDeviceInboxOptions,
  SendInboxOptions,
  GetInboxOptions,
  InboxStatus,
} from '../types';

export class Inbox {
  constructor(private client: HttpClient) {}

  /**
   * Send an inbox message to a user.
   */
  async sendToUser(options: SendToUserInboxOptions): Promise<InboxMessage> {
    return this.client.post<InboxMessage>('/inbox/api/send-to-user', options);
  }

  /**
   * Send an inbox message to multiple users.
   */
  async sendToUsers(options: SendToUsersInboxOptions): Promise<{ sentCount: number }> {
    return this.client.post<{ sentCount: number }>('/inbox/api/send-to-users', options);
  }

  /**
   * Send an inbox message to a specific device.
   */
  async sendToDevice(options: SendToDeviceInboxOptions): Promise<InboxMessage> {
    return this.client.post<InboxMessage>('/inbox/api/send-to-device', options);
  }

  /**
   * Broadcast an inbox message to all users.
   */
  async broadcast(options: SendInboxOptions): Promise<{ sentCount: number }> {
    return this.client.post<{ sentCount: number }>('/inbox/api/broadcast', options);
  }

  /**
   * Get inbox messages for a user or device.
   */
  async getMessages(options: GetInboxOptions): Promise<InboxMessage[]> {
    return this.client.post<InboxMessage[]>('/inbox/messages', options);
  }

  /**
   * Get a single inbox message.
   */
  async getMessage(id: string): Promise<InboxMessage> {
    return this.client.get<InboxMessage>(`/inbox/messages/${id}`);
  }

  /**
   * Update message status (read, archived, deleted).
   */
  async updateStatus(id: string, status: InboxStatus): Promise<InboxMessage> {
    return this.client.put<InboxMessage>(`/inbox/messages/${id}`, { status });
  }

  /**
   * Update status for multiple messages.
   */
  async updateMultiple(messageIds: string[], status: InboxStatus): Promise<{ updated: number }> {
    return this.client.post<{ updated: number }>('/inbox/messages/mark-multiple', { messageIds, status });
  }

  /**
   * Mark all messages as read for a user or device.
   */
  async markAllRead(options: { userId?: string; deviceId?: string }): Promise<{ updated: number }> {
    return this.client.post<{ updated: number }>('/inbox/messages/mark-all-read', options);
  }

  /**
   * Delete an inbox message.
   */
  async delete(id: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/inbox/messages/${id}`);
  }
}
