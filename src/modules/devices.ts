import { HttpClient } from '../client';
import { Device, DeviceFilterOptions, DeviceListFilters, Paginated } from '../types';

export class Devices {
  constructor(private client: HttpClient) {}

  /**
   * List all registered devices.
   */
  async list(): Promise<Device[]> {
    return this.client.get<Device[]>('/devices');
  }

  /**
   * List devices one page at a time, with filters. Unlike `list()`, this
   * includes inactive (unregistered) devices unless you pass `isActive`.
   *
   * @example
   * ```ts
   * const { items, total } = await rivium.devices.listPage({ platform: 'web', sdkName: 'web', page: 1, limit: 50 });
   * ```
   */
  async listPage(filters: DeviceListFilters = {}): Promise<Paginated<Device>> {
    const { page, limit, ...rest } = filters;
    // The backend only paginates when page or limit is present.
    return this.client.get<Paginated<Device>>('/devices', { page: page ?? 1, limit, ...rest });
  }

  /**
   * Distinct app versions, SDK name/version pairs and recent failure reasons,
   * with counts — the values `listPage()` can filter on.
   */
  async filterOptions(): Promise<DeviceFilterOptions> {
    return this.client.get<DeviceFilterOptions>('/devices/filter-options');
  }

  /**
   * Soft-unregister a device: it stops receiving sends but keeps its row and
   * receipt history. The device is reactivated by `reactivate()` or by its
   * SDK's next register(). Use `delete()` to remove it entirely.
   */
  async unregister(deviceId: string): Promise<{ deviceId: string; isActive: false }> {
    return this.client.post<{ deviceId: string; isActive: false }>(
      `/devices/${encodeURIComponent(deviceId)}/unregister`,
    );
  }

  /**
   * Reactivate a soft-unregistered device.
   */
  async reactivate(deviceId: string): Promise<{ deviceId: string; isActive: true }> {
    return this.client.post<{ deviceId: string; isActive: true }>(
      `/devices/${encodeURIComponent(deviceId)}/reactivate`,
    );
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
