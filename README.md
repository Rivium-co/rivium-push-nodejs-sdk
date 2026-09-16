# RiviumPush Node.js SDK

Server-side SDK for [RiviumPush](https://rivium.co) — push notifications, inbox, in-app messages, and more.

## Installation

```bash
npm install @rivium/push-node
```

## Quick Start

```typescript
import { RiviumPush } from '@rivium/push-node';

const riviumPush = new RiviumPush({
  apiKey: 'rv_live_xxxxxxxxxxxxxxxxxxxxx',
  serverSecret: 'rv_srv_xxxxxxxxxxxxxxxxxxxxx', // Required for server-side operations
});

// Send a push notification
await riviumPush.push.sendToUser({
  userId: 'user-123',
  title: 'Order Shipped',
  body: 'Your order #1234 has been shipped!',
  data: { orderId: '1234' },
});
```

> **Note:** Both `apiKey` and `serverSecret` are required for all server-side SDK operations. You can find these credentials in your [Rivium Console](https://console.rivium.co) when you create a project.

## Push Notifications

```typescript
// Send to a specific device
await riviumPush.push.sendToDevice({
  deviceId: 'device-uuid',
  title: 'Hello',
  body: 'Welcome to our app!',
});

// Send to a user (all their devices)
await riviumPush.push.sendToUser({
  userId: 'user-123',
  title: 'New Message',
  body: 'You have a new message',
});

// Send to multiple devices
await riviumPush.push.sendToDevices({
  deviceIds: ['device-1', 'device-2', 'device-3'],
  title: 'Update Available',
  body: 'A new version is available',
});

// Send to a topic (e.g., "promotions")
await riviumPush.push.sendToTopic({
  topic: 'promotions',
  title: 'Flash Sale!',
  body: '50% off everything today only',
  imageUrl: 'https://example.com/sale.jpg',
});

// Send to a segment
await riviumPush.push.sendToSegment({
  segmentId: 'segment-uuid',
  title: 'Exclusive Offer',
  body: 'Just for our VIP customers',
});

// Broadcast to all devices
await riviumPush.push.broadcast({
  title: 'App Update',
  body: 'Check out the new features!',
});
```

### Handling the Response

Every send returns `{ success, failed, reason? }`. When the target had **zero registered devices** the message is not attempted and `reason` is set to `'no_recipients'` — distinct from a real delivery failure:

```typescript
const result = await riviumPush.push.sendToUser({
  userId: 'user-123',
  title: 'Your order shipped',
  body: 'Track it from the app',
});

if (result.reason === 'no_recipients') {
  // User has no device registered with Rivium Push.
  // Fall back to email / SMS, mark them as push-unreachable, etc.
} else if (result.failed > 0) {
  // Real delivery failure on at least one device.
}
```

### App Identifier

If your project has multiple apps (e.g. a shopping app and a chat app), use `appIdentifier` to target a specific app. This is the bundle ID / package name of the app (e.g. `com.myapp.ios`).

```typescript
// Send only to a specific app on the device
await riviumPush.push.sendToUser({
  userId: 'user-123',
  title: 'New Order',
  body: 'Your order is ready',
  appIdentifier: 'com.myshop.app', // only this app receives it
});
```

> **Note:** `appIdentifier` is optional. If not set, the notification is sent to all apps registered under your project. Most projects have a single app, so you don't need to set it.

### Rich Notifications

```typescript
await riviumPush.push.sendToUser({
  userId: 'user-123',
  title: 'New Product',
  body: 'Check out our latest arrival',
  imageUrl: 'https://example.com/product.jpg',
  actions: [
    { id: 'buy', title: 'Buy Now', action: 'OPEN_PRODUCT' },
    { id: 'later', title: 'Save for Later' },
  ],
  deepLink: 'myapp://product/123',
  data: { productId: '123' },
});
```

### Using Templates

```typescript
await riviumPush.push.sendToUser({
  userId: 'user-123',
  templateId: 'order-shipped-template',
  templateVariables: {
    orderNumber: '#1234',
    trackingUrl: 'https://track.example.com/1234',
  },
});
```

## Inbox Messages

```typescript
// Send inbox message to a user
await riviumPush.inbox.sendToUser({
  userId: 'user-123',
  content: {
    title: 'Welcome!',
    body: 'Thanks for joining us.',
    imageUrl: 'https://example.com/welcome.jpg',
    deepLink: 'myapp://onboarding',
  },
});

// Send to multiple users
await riviumPush.inbox.sendToUsers({
  userIds: ['user-1', 'user-2', 'user-3'],
  content: {
    title: 'New Feature',
    body: 'Check out our latest feature',
  },
});

// Send to a specific app only
await riviumPush.inbox.sendToUser({
  userId: 'user-123',
  appIdentifier: 'com.myshop.app',
  content: {
    title: 'Order Update',
    body: 'Your order has shipped',
  },
});

// Broadcast to all
await riviumPush.inbox.broadcast({
  content: {
    title: 'Holiday Sale',
    body: 'Up to 70% off!',
  },
  expiresAt: '2025-12-31T23:59:59Z',
});
```

## Device Management

```typescript
// List all devices
const devices = await riviumPush.devices.list();

// Subscribe a device to a topic
await riviumPush.devices.subscribeTopic('device-uuid', 'news');

// Unsubscribe from a topic
await riviumPush.devices.unsubscribeTopic('device-uuid', 'news');

// Associate device with a user
await riviumPush.devices.setUserId('device-uuid', 'user-123');

// Delete a device
await riviumPush.devices.delete('device-uuid');

// Paginated, filtered list (includes inactive devices unless isActive is set)
const { items, total } = await riviumPush.devices.listPage({
  platform: 'web',
  sdkName: 'web',
  isActive: true,
  page: 1,
  limit: 50,
});
console.log(items[0]?.sdkName, items[0]?.sdkVersion, items[0]?.appVersion, items[0]?.updatedAt);

// Values you can filter on (app versions, SDK versions, failure reasons)
const options = await riviumPush.devices.filterOptions();

// Soft-unregister (stops sends, keeps history) and undo it
await riviumPush.devices.unregister('device-uuid');
await riviumPush.devices.reactivate('device-uuid');
```

`list()` is unchanged and still returns a plain array of active devices.

## Delivery Receipts

A send's `success` count means the push service *accepted* the notification.
Receipts show what happened per device.

```typescript
const { messageId } = await riviumPush.push.sendToUser({ userId: 'user-123', title: 'Hi', body: 'Hello' });
const receipts = await riviumPush.receipts.getForMessage(messageId!);

// Paginated receipt log with filters
const { items } = await riviumPush.receipts.list({ status: 'failed', platform: 'ios', page: 1, limit: 100 });

// Delivery analytics (default range: last 30 days)
const analytics = await riviumPush.receipts.analytics({
  startDate: new Date(Date.now() - 7 * 86400_000),
  endDate: new Date(),
  bucket: 'day',
});
console.log(analytics.totals.deliveryRate, analytics.topFailureReasons);
```

## Templates

```typescript
// Create a template
const template = await riviumPush.templates.create({
  name: 'Order Shipped',
  title: 'Your order {{orderNumber}} has shipped!',
  body: 'Track your package: {{trackingUrl}}',
  variables: ['orderNumber', 'trackingUrl'],
});

// List templates
const templates = await riviumPush.templates.list();

// Render a template (preview)
const rendered = await riviumPush.templates.render(template.id, {
  orderNumber: '#1234',
  trackingUrl: 'https://track.example.com/1234',
});
```

## Segments

```typescript
// Create a segment
const segment = await riviumPush.segments.create({
  name: 'VIP Customers',
  description: 'Customers with more than 10 orders',
  filters: [
    { field: 'metadata.orders', operator: 'gt', value: 10 },
  ],
});

// Get devices in a segment
const devices = await riviumPush.segments.getDevices(segment.id);

// Recalculate segment membership
await riviumPush.segments.recalculate(segment.id);
```

## Scheduled Messages

```typescript
// Schedule a message
const scheduled = await riviumPush.scheduled.create({
  title: 'Reminder',
  body: 'Don\'t forget to complete your purchase!',
  targetType: 'user',
  targetValue: 'user-123',
  scheduledAt: '2025-02-14T09:00:00Z',
  timezone: 'America/New_York',
});

// List pending messages
const pending = await riviumPush.scheduled.listPending();

// Cancel a scheduled message
await riviumPush.scheduled.cancel(scheduled.id);
```

## Webhooks

```typescript
// Create a webhook
const webhook = await riviumPush.webhooks.create({
  name: 'Order Events',
  url: 'https://example.com/webhooks/rivium-push',
  events: [
    'message.sent',
    'message.delivered',
    'message.failed',
    'message.no_recipients',
    'message.opened',
    'message.clicked',
  ],
  secret: 'my-secret-key',
});

// Test a webhook
await riviumPush.webhooks.test(webhook.id, 'message.opened');

// Get delivery logs
const logs = await riviumPush.webhooks.getLogs(webhook.id);
```

## Analytics

```typescript
// Get overview stats
const overview = await riviumPush.analytics.getOverview();
console.log(`Delivery rate: ${overview.deliveryRate}%`);

// Get daily stats
const daily = await riviumPush.analytics.getDaily(30); // Last 30 days

// Get app stats
const stats = await riviumPush.analytics.getStats();
console.log(`Total devices: ${stats.totalDevices}`);
```

## A/B Testing

```typescript
// Create an A/B test
const test = await riviumPush.abTesting.create({
  appId: 'your-app-id',
  name: 'Notification Copy Test',
  variants: [
    {
      name: 'Control',
      title: 'Check this out',
      body: 'See what\'s new',
      trafficPercentage: 50,
    },
    {
      name: 'Urgency',
      title: 'Don\'t miss out!',
      body: 'Limited time offer',
      trafficPercentage: 50,
    },
  ],
});

// Start the test
await riviumPush.abTesting.start(test.id);

// Get results
const results = await riviumPush.abTesting.getResults(test.id);
```

## In-App Messages

```typescript
// Create an in-app message
const message = await riviumPush.inApp.create('your-app-id', {
  name: 'Welcome Modal',
  type: 'modal',
  content: {
    title: 'Welcome!',
    body: 'Thanks for downloading our app',
    imageUrl: 'https://example.com/welcome.jpg',
    buttons: [
      { id: 'start', text: 'Get Started', action: 'dismiss', style: 'primary' },
    ],
  },
  triggerType: 'on_app_open',
  maxImpressions: 1,
});

// Activate the message
await riviumPush.inApp.activate('your-app-id', message.id);
```

## Error Handling

```typescript
import { RiviumPush, RiviumPushError } from '@rivium/push-node';

try {
  await riviumPush.push.sendToUser({
    userId: 'user-123',
    title: 'Hello',
    body: 'World',
  });
} catch (error) {
  if (error instanceof RiviumPushError) {
    console.error(`Status: ${error.statusCode}`);
    console.error(`Message: ${error.message}`);
    console.error(`Response:`, error.response);
  }
}
```

## Configuration

```typescript
const riviumPush = new RiviumPush({
  apiKey: 'rv_live_xxxxxxxxxxxxxxxxxxxxx',        // Required - from Rivium Console
  serverSecret: 'rv_srv_xxxxxxxxxxxxxxxxxxxxx',   // Required - from Rivium Console
});
```

### Environment Variables

We recommend using environment variables to store your credentials:

```typescript
const riviumPush = new RiviumPush({
  apiKey: process.env.RIVIUM_API_KEY!,
  serverSecret: process.env.RIVIUM_SERVER_SECRET!,
});
```

```bash
# .env
RIVIUM_API_KEY=rv_live_xxxxxxxxxxxxxxxxxxxxx
RIVIUM_SERVER_SECRET=rv_srv_xxxxxxxxxxxxxxxxxxxxx
```

### Credentials

| Credential | Format | Description |
|------------|--------|-------------|
| **API Key** | `rv_live_xxx` | Used for client-side SDKs (iOS, Android, Web) and server-side SDKs |
| **Server Secret** | `rv_srv_xxx` | **Required** for server-side operations. Never expose in client-side code. |

Both credentials are generated when you create a project in the [Rivium Console](https://console.rivium.co). Store them securely and never commit them to version control.

## Links

- [Rivium Push](https://rivium.co/cloud/rivium-push) - Learn more about Rivium Push
- [Documentation](https://rivium.co/cloud/rivium-push/docs/quick-start) - Full documentation and guides
- [Rivium Console](https://console.rivium.co) - Manage your push notifications

## License

MIT — see [LICENSE](LICENSE) for details.
