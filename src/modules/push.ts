import { HttpClient } from '../client';
import {
  SendPushOptions,
  SendToDeviceOptions,
  SendToUserOptions,
  SendToDevicesOptions,
  SendToTopicOptions,
  SendToSegmentOptions,
  SendResult,
} from '../types';

export class Push {
  constructor(private client: HttpClient) {}

  /**
   * Send a push notification to a specific device.
   */
  async sendToDevice(options: SendToDeviceOptions): Promise<SendResult> {
    return this.client.post<SendResult>('/push/send', options);
  }

  /**
   * Send a push notification to all devices belonging to a user.
   */
  async sendToUser(options: SendToUserOptions): Promise<SendResult> {
    return this.client.post<SendResult>('/push/send-to-user', options);
  }

  /**
   * Send a push notification to multiple devices.
   */
  async sendToDevices(options: SendToDevicesOptions): Promise<SendResult> {
    return this.client.post<SendResult>('/push/send-to-devices', options);
  }

  /**
   * Broadcast a push notification to all devices.
   */
  async broadcast(options: SendPushOptions): Promise<SendResult> {
    return this.client.post<SendResult>('/push/broadcast', options);
  }

  /**
   * Send a push notification to all devices subscribed to a topic.
   */
  async sendToTopic(options: SendToTopicOptions): Promise<SendResult> {
    return this.client.post<SendResult>('/push/send-to-topic', options);
  }

  /**
   * Send a push notification to all devices in a segment.
   */
  async sendToSegment(options: SendToSegmentOptions): Promise<SendResult> {
    return this.client.post<SendResult>('/push/send-to-segment', options);
  }
}
