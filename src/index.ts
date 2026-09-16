import { HttpClient } from './client';
import { Push } from './modules/push';
import { Devices } from './modules/devices';
import { Templates } from './modules/templates';
import { Segments } from './modules/segments';
import { Scheduled } from './modules/scheduled';
import { Inbox } from './modules/inbox';
import { InApp } from './modules/in-app';
import { ABTesting } from './modules/ab-testing';
import { Webhooks } from './modules/webhooks';
import { Analytics } from './modules/analytics';
import { Receipts } from './modules/receipts';
import { RiviumPushConfig } from './types';

export class RiviumPush {
  private client: HttpClient;

  /** Push notifications */
  public push: Push;

  /** Device management */
  public devices: Devices;

  /** Notification templates */
  public templates: Templates;

  /** User segments */
  public segments: Segments;

  /** Scheduled messages */
  public scheduled: Scheduled;

  /** Inbox messages */
  public inbox: Inbox;

  /** In-app messages */
  public inApp: InApp;

  /** A/B testing */
  public abTesting: ABTesting;

  /** Webhooks */
  public webhooks: Webhooks;

  /** Analytics */
  public analytics: Analytics;
  /** Per-device delivery receipts for messages you have sent. */
  public receipts: Receipts;

  constructor(config: RiviumPushConfig) {
    this.client = new HttpClient(config);
    this.push = new Push(this.client);
    this.devices = new Devices(this.client);
    this.templates = new Templates(this.client);
    this.segments = new Segments(this.client);
    this.scheduled = new Scheduled(this.client);
    this.inbox = new Inbox(this.client);
    this.inApp = new InApp(this.client);
    this.abTesting = new ABTesting(this.client);
    this.webhooks = new Webhooks(this.client);
    this.analytics = new Analytics(this.client);
    this.receipts = new Receipts(this.client);
  }
}

export { RiviumPushError } from './client';
export { SDK_NAME, SDK_VERSION } from './version';

// Re-export types
export * from './types';
