// ─── Configuration ───────────────────────────────────────────────

export interface RiviumPushConfig {
  /** Your Rivium API key (rv_live_xxx or rv_test_xxx) */
  apiKey: string;
  /** Server secret for server-side authentication (rv_srv_xxx) - required for all server operations */
  serverSecret: string;
}

// ─── Common ──────────────────────────────────────────────────────

/** Page-numbered list response. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

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
  /**
   * Id of the message this send created. Use it to fetch delivery receipts
   * later — `success` only means the push service accepted the notification,
   * not that any device received it.
   */
  messageId?: string;
}

// ─── Delivery receipts ───────────────────────────────────────────

/** Which transport carried a notification to a device. */
export type DeliveryTransport = 'apns' | 'voip' | 'webpush' | 'pn';

export type ReceiptStatus =
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'failed'
  | 'dismissed';

export interface DeliveryReceipt {
  id: string;
  messageId: string;
  deviceId: string;
  userId?: string;
  platform?: string;
  /** `sent` = accepted by the transport; `delivered` = confirmed by the device. */
  status: ReceiptStatus;
  transport?: DeliveryTransport;
  /** The push service's own id — APNs `apns-id`. Quote it when escalating. */
  providerMessageId?: string;
  /** Failure reason, e.g. 'Unregistered', 'Gone', 'BadDeviceToken'. */
  error?: string;
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  /** SDK that registered the device (send-time snapshot, device fallback). */
  sdkName?: string | null;
  sdkVersion?: string | null;
  appVersion?: string | null;
}

/** One row of `receipts.list()`. */
export interface ReceiptListItem {
  id: string;
  messageId: string;
  messageTitle: string;
  deviceId: string;
  userId: string | null;
  status: ReceiptStatus;
  platform: string | null;
  transport: string | null;
  providerMessageId: string | null;
  error: string | null;
  actionId: string | null;
  sentAt: string;
  deliveredAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  /** Send-time snapshot, falling back to the device's current values; null = unknown. */
  sdkName: string | null;
  sdkVersion: string | null;
  appVersion: string | null;
}

export interface ReceiptListFilters {
  /** 1-based page (default 1). */
  page?: number;
  /** Page size (default 50, max 200). */
  limit?: number;
  platform?: Platform;
  status?: ReceiptStatus;
  transport?: DeliveryTransport;
  /** Exact failure reason, e.g. 'Unregistered'. */
  error?: string;
  /** true = only failed receipts with a reason; false = only without. */
  hasError?: boolean;
  userId?: string;
  deviceId?: string;
  messageId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface ReceiptCounts {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  /**
   * Receipts the device itself acked. iOS can only confirm with a Notification
   * Service Extension, so a low iOS delivery rate is expected without one.
   */
  deliveryConfirmedCount: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  failureRate: number;
}

export interface ReceiptAnalyticsOptions {
  /** Default: 30 days before endDate. */
  startDate?: Date | string;
  /** Default: now. */
  endDate?: Date | string;
  /** Default 'day'. */
  bucket?: 'day' | 'hour';
}

export interface ReceiptAnalytics {
  startDate: string;
  endDate: string;
  bucket: 'day' | 'hour';
  totals: ReceiptCounts;
  /** `needsNse` is true for iOS: background delivery is only confirmed with a Notification Service Extension. */
  byPlatform: (ReceiptCounts & { platform: string; needsNse: boolean })[];
  timeseries: (ReceiptCounts & { bucket: string; platform: string })[];
  topFailureReasons: { platform: string; error: string; count: number }[];
  byTransport: (ReceiptCounts & { transport: string })[];
  /** 'unknown' when neither the receipt nor the device recorded an SDK. */
  bySdkVersion: (ReceiptCounts & { sdkName: string; sdkVersion: string })[];
}

export interface MessageDeliveryStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
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
  isActive?: boolean;
  appVersion?: string | null;
  /** SDK that last registered the device, e.g. 'web', 'ios', 'flutter'. */
  sdkName?: string | null;
  sdkVersion?: string | null;
  createdAt: string;
  /** Last registration/update; used as "last seen". */
  updatedAt?: string;
}

export interface DeviceListFilters {
  /** 1-based page (default 1). */
  page?: number;
  /** Page size (default 50, max 200). */
  limit?: number;
  platform?: Platform;
  isActive?: boolean;
  userId?: string;
  appVersion?: string;
  sdkName?: string;
  sdkVersion?: string;
  /** Substring match on deviceId or userId. */
  search?: string;
  lastSeenBefore?: Date | string;
  lastSeenAfter?: Date | string;
  /** The device's most recent receipt failure reason, e.g. 'Unregistered'. */
  failureReason?: string;
}

export interface DeviceFilterOptions {
  appVersions: { appVersion: string; count: number }[];
  sdks: { sdkName: string; sdkVersion: string; count: number }[];
  failureReasons: { error: string; count: number }[];
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
