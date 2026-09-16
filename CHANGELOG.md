# Changelog

## 0.1.4

- Added: `receipts.list()` (paginated, filterable receipt log) and `receipts.analytics()` (totals, breakdowns, timeseries, top failure reasons).
- Added: `devices.listPage()`, `devices.filterOptions()`, `devices.unregister()` and `devices.reactivate()`. `devices.list()` is unchanged.
- Requests now send an `X-Rivium-SDK` header; `SDK_NAME` and `SDK_VERSION` are exported.
- `Date` query values are sent as ISO strings.

## 0.1.3

- Added `receipts` — per-device delivery receipts for messages you have sent. A send result counts what APNs, FCM or Web Push *accepted*, which is not the same as delivered; receipts carry the device, transport, failure reason, and whether the device confirmed receipt. Includes `getForMessage()`, `getMessageStats()` and action-button click counts.

## 0.1.2

- Added `segments.preview()` for dry-running filter sets before creating a segment. Returns the total match count and a sample of matching devices.
- `SegmentFilter` operators updated to match the backend: added `not_equals`, `not_contains`, `greater_than`, `less_than`, `not_in`, `exists`; removed the unsupported `starts_with`, `gt`, `lt`, `between`. `value` now also accepts `boolean`.

## 0.1.1

- `SendResult` gains an optional `reason?: 'no_recipients'` field. Set when the target had zero registered devices so the call can be distinguished from a real delivery failure without polling the message row.
- `WebhookEvent` union adds `'message.no_recipients'` (new event fired by the backend for the same case) and `'message.failed'` (the backend always emitted this event — it was missing from the published type).

Both changes are additive and backward compatible.

## 0.1.0

- Initial release.
