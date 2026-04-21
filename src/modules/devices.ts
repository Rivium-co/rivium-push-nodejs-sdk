import { HttpClient } from '../client';
import { Device } from '../types';

export class Devices {
  constructor(private client: HttpClient) {}

  /**
   * List all registered devices.
   */
  async list(): Promise<Device[]> {
    return this.client.get<Device[]>('/devices');
  }

  /**
   * Delete a device by its deviceId.
   */
  async delete(deviceId: string): Promise<{ message: string }> {
    return this.client.delete<{ message: string }>(`/devices/${deviceId}`);
  }

  /**
   * Delete multiple devices at once.
   */
  async bulkDelete(deviceIds: string[]): Promise<{ message: string; deleted: number }> {
    return this.client.post<{ message: string; deleted: number }>('/devices/bulk-delete', { deviceIds });
  }

  /**
   * Subscribe a device to a topic.
   */
  async subscribeTopic(deviceId: string, topic: string): Promise<{ message: string }> {
    return this.client.post<{ message: string }>(`/devices/${deviceId}/topics/${topic}`);
  }

  /**
   * Unsubscribe a device from a topic.
   */
  async unsubscribeTopic(deviceId: string, topic: string): Promise<{ message: string }> {
    return this.client.delete<{ message: string }>(`/devices/${deviceId}/topics/${topic}`);
  }

  /**
   * Associate a device with a user.
   */
  async setUserId(deviceId: string, userId: string): Promise<{ message: string }> {
    return this.client.post<{ message: string }>(`/devices/${deviceId}/user`, { userId });
  }

  /**
   * Disassociate a device from its user.
   */
  async clearUserId(deviceId: string): Promise<{ message: string }> {
    return this.client.delete<{ message: string }>(`/devices/${deviceId}/user`);
  }
}
