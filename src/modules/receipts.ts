import { HttpClient } from '../client';
import { DeliveryReceipt, MessageDeliveryStats } from '../types';

/**
 * Delivery receipts — what actually happened to a notification, per device.
 *
 * A send returns `success` / `failed`, but those count what the push service
 * *accepted*: APNs, FCM and Web Push confirm acceptance, never delivery.
 * Receipts carry the rest of the story — which device, over which transport,
 * why it failed, and whether the device confirmed receipt.
 *
 * Receipts are written for targeted sends (`sendToUser`, `sendToDevices`).
 * Broadcasts record an aggregated per-platform breakdown on the message
 * instead, since a row per device does not scale to a large audience.
 */
export class Receipts {
  constructor(private client: HttpClient) {}

  /**
   * Get every receipt for a message.
   *
   * @param messageId `messageId` from the SendResult of the original send.
   */
  async getForMessage(messageId: string): Promise<DeliveryReceipt[]> {
    return this.client.get<DeliveryReceipt[]>(
      `/receipts/message/${encodeURIComponent(messageId)}`,
    );
  }

  /**
   * Get delivery/open/click rates for one message.
   */
  async getMessageStats(messageId: string): Promise<MessageDeliveryStats> {
    return this.client.get<MessageDeliveryStats>(
      `/receipts/message/${encodeURIComponent(messageId)}/stats`,
    );
  }

  /**
   * Get click counts per notification action button for one message.
   */
  async getActionStats(
    messageId: string,
  ): Promise<{ actionId: string; count: number }[]> {
    return this.client.get<{ actionId: string; count: number }[]>(
      `/receipts/message/${encodeURIComponent(messageId)}/actions`,
    );
  }

  /**
   * Get recent receipts for one device — useful for answering
   * "did this user receive anything?".
   */
  async getForDevice(
    deviceId: string,
    limit?: number,
  ): Promise<DeliveryReceipt[]> {
    return this.client.get<DeliveryReceipt[]>(
      `/receipts/device/${encodeURIComponent(deviceId)}`,
      { limit },
    );
  }

  /**
   * Get aggregate delivery stats for the project over a date range.
   */
  async getStats(
    startDate: Date | string,
    endDate: Date | string,
  ): Promise<MessageDeliveryStats> {
    return this.client.get<MessageDeliveryStats>('/receipts/stats', {
      startDate: startDate instanceof Date ? startDate.toISOString() : startDate,
      endDate: endDate instanceof Date ? endDate.toISOString() : endDate,
    });
  }
}
