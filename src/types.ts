// ─── Configuration ───────────────────────────────────────────────

export interface RiviumPushConfig {
  /** Your Rivium API key (rv_live_xxx or rv_test_xxx) */
  apiKey: string;
  /** Server secret for server-side authentication (rv_srv_xxx) - required for all server operations */
  serverSecret: string;
}

// ─── Common ──────────────────────────────────────────────────────

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface BillingInfo {
  messagesCharged: number;
  remaining: number;
}

export interface SendResult {
  success: number;
  failed: number;
  // Set to 'no_recipients' when the target had zero registered devices.
  // Distinguishes "no one to send to" from a real delivery failure.
  reason?: 'no_recipients';
  billing?: BillingInfo;
}

// ─── Push ────────────────────────────────────────────────────────

export interface NotificationAction {
  id: string;
  title: string;
  action?: string;
  icon?: string;
  destructive?: boolean;
  authRequired?: boolean;
}

export interface Localization {
  locale: string;
  title: string;
  body: string;
}

export interface SendPushOptions {
  title?: string;
  body?: string;
  templateId?: string;
  templateVariables?: Record<string, string>;
  locale?: string;
  data?: Record<string, any>;
  silent?: boolean;
  imageUrl?: string;
  iconUrl?: string;
  actions?: NotificationAction[];
  deepLink?: string;
  badge?: number;
  badgeAction?: 'set' | 'increment' | 'decrement' | 'clear';
  sound?: string;
  threadId?: string;
  collapseKey?: string;
  category?: string;
  priority?: 'default' | 'high' | 'low';
  ttl?: number;
  localizations?: Localization[];
  timezone?: string;
  campaignId?: string;
  /** Optional app identifier to scope delivery to a specific app on the same device */
  appIdentifier?: string;
}

export interface SendToDeviceOptions extends SendPushOptions {
  deviceId: string;
}

export interface SendToUserOptions extends SendPushOptions {
  userId: string;
}

export interface SendToDevicesOptions extends SendPushOptions {
  deviceIds: string[];
}

export interface SendToTopicOptions extends SendPushOptions {
  topic: string;
}

export interface SendToSegmentOptions extends SendPushOptions {
  segmentId: string;
}

// ─── Devices ─────────────────────────────────────────────────────

export type Platform = 'android' | 'ios' | 'web';

export interface Device {
  id: string;
  deviceId: string;
  platform: Platform;
  appId: string;
  appIdentifier?: string;
  userId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// ─── Templates ───────────────────────────────────────────────────

export interface CreateTemplateOptions {
  name: string;
  description?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  variables?: string[];
  localizations?: Record<string, { title: string; body: string }>;
}

export interface UpdateTemplateOptions extends Partial<CreateTemplateOptions> {}

export interface Template {
  id: string;
  name: string;
  description?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  variables?: string[];
  localizations?: Record<string, { title: string; body: string }>;
  createdAt: string;
  updatedAt: string;
}

// ─── Segments ────────────────────────────────────────────────────

export type SegmentFilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'in'
  | 'not_in'
  | 'exists';

export interface SegmentFilter {
  field: string; // e.g., 'platform', 'metadata.plan', 'metadata.totalSpent'
  operator: SegmentFilterOperator;
  value: string | number | boolean | string[];
}

export interface CreateSegmentOptions {
  name: string;
  description?: string;
  color?: string;
  filters?: SegmentFilter[];
}

export interface UpdateSegmentOptions extends Partial<CreateSegmentOptions> {}

export interface Segment {
  id: string;
  name: string;
  description?: string;
  color?: string;
  filters?: SegmentFilter[];
  deviceCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentPreviewOptions {
  filters?: SegmentFilter[];
  /** Number of sample devices to return (max 50, default 20). */
  limit?: number;
}

export interface SegmentPreviewResult {
  /** Total number of devices matching the filters. */
  count: number;
  /** Small sample of matching devices (up to `limit`). */
  preview: Array<{
    deviceId: string;
    platform: string;
    userId: string | null;
    topics: string[] | null;
    metadata: Record<string, any> | null;
  }>;
}

// ─── Scheduled ───────────────────────────────────────────────────

export interface CreateScheduledOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  targetType: 'all' | 'user' | 'device' | 'topic' | 'segment';
  targetValue?: string;
  scheduledAt: string;
  timezone?: string;
}

export interface UpdateScheduledOptions extends Partial<CreateScheduledOptions> {}

export interface ScheduledMessage {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  targetType: string;
  targetValue?: string;
  scheduledAt: string;
  timezone?: string;
  status: string;
  createdAt: string;
}

// ─── Inbox ───────────────────────────────────────────────────────

export interface InboxContent {
  title: string;
  body: string;
  imageUrl?: string;
  iconUrl?: string;
  deepLink?: string;
  data?: Record<string, any>;
}

export interface InboxLocalization {
  locale: string;
  content: InboxContent;
}

export interface SendInboxOptions {
  content: InboxContent;
  localizations?: InboxLocalization[];
  appIdentifier?: string;
  category?: string;
  expiresAt?: string;
  campaignId?: string;
}

export interface SendToUserInboxOptions extends SendInboxOptions {
  userId: string;
}

export interface SendToUsersInboxOptions extends SendInboxOptions {
  userIds: string[];
}

export interface SendToDeviceInboxOptions extends SendInboxOptions {
  deviceId: string;
}

export interface InboxMessage {
  id: string;
  content: InboxContent;
  status: 'unread' | 'read' | 'archived' | 'deleted';
  category?: string;
  createdAt: string;
}

export type InboxStatus = 'unread' | 'read' | 'archived' | 'deleted';

export interface GetInboxOptions extends PaginationParams {
  userId?: string;
  deviceId?: string;
  status?: InboxStatus;
  category?: string;
  locale?: string;
}

// ─── In-App Messages ─────────────────────────────────────────────

export interface InAppButton {
  id: string;
  text: string;
  action: 'dismiss' | 'deep_link' | 'url' | 'custom';
  value?: string;
  style?: 'primary' | 'secondary' | 'text' | 'destructive';
}

export interface InAppContent {
  title: string;
  body: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  buttons?: InAppButton[];
}

export interface CreateInAppOptions {
  name: string;
  type: 'modal' | 'banner' | 'card' | 'notification';
  content: InAppContent;
  localizations?: { locale: string; content: InAppContent }[];
  triggerType?: 'on_app_open' | 'on_event' | 'on_screen_view' | 'manual';
  triggerEvent?: string;
  triggerConditions?: Record<string, any>;
  segmentId?: string;
  targetUserIds?: string[];
  startDate?: string;
  endDate?: string;
  maxImpressions?: number;
  minSessionCount?: number;
  delaySeconds?: number;
  priority?: number;
}

export interface UpdateInAppOptions extends Partial<CreateInAppOptions> {}

export interface InAppMessage {
  id: string;
  name: string;
  type: string;
  content: InAppContent;
  status: string;
  createdAt: string;
}

// ─── A/B Testing ─────────────────────────────────────────────────

export interface ABTestVariantDef {
  name: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  deepLink?: string;
  actions?: NotificationAction[];
  trafficPercentage: number;
}

export interface CreateABTestOptions {
  name: string;
  description?: string;
  targetType?: string;
  segmentId?: string;
  targetPercentage?: number;
  hasControlGroup?: boolean;
  controlGroupPercentage?: number;
  winningMetric?: string;
  testDurationHours?: number;
  autoSelectWinner?: boolean;
  enableEarlyStopping?: boolean;
  significanceThreshold?: number;
  minimumSampleSize?: number;
  variants: ABTestVariantDef[];
}

export interface ABTest {
  id: string;
  name: string;
  status: string;
  variants: any[];
  createdAt: string;
}

// ─── Webhooks ────────────────────────────────────────────────────

export type WebhookEvent =
  | 'message.sent'
  | 'message.delivered'
  | 'message.failed'
  | 'message.no_recipients'
  | 'message.opened'
  | 'message.clicked'
  | 'device.registered'
  | 'device.unregistered';

export interface CreateWebhookOptions {
  name: string;
  url: string;
  secret?: string;
  events: WebhookEvent[];
  isActive?: boolean;
  maxRetries?: number;
  timeoutMs?: number;
}

export interface UpdateWebhookOptions extends Partial<CreateWebhookOptions> {}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  isActive: boolean;
  createdAt: string;
}

// ─── Analytics ───────────────────────────────────────────────────

export interface AnalyticsOverview {
  totalDevices: number;
  activeDevices: number;
  totalMessages: number;
  totalDelivered: number;
  totalFailed: number;
  totalPending: number;
  totalNoTargets: number;
  totalAttempts: number;
  deliveryRate: number;
  platformDistribution: { android: number; ios: number; web: number };
}

export interface DailyStats {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
}

// ─── Stats ───────────────────────────────────────────────────────

export interface AppStats {
  totalDevices: number;
  activeDevices: number;
  androidDevices: number;
  iosDevices: number;
  totalTopics: number;
  topics: string[];
  totalUsers: number;
}
