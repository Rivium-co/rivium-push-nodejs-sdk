# Changelog

## 0.1.1

- `SendResult` gains an optional `reason?: 'no_recipients'` field. Set when the target had zero registered devices so the call can be distinguished from a real delivery failure without polling the message row.
- `WebhookEvent` union adds `'message.no_recipients'` (new event fired by the backend for the same case) and `'message.failed'` (the backend always emitted this event — it was missing from the published type).

Both changes are additive and backward compatible.

## 0.1.0

- Initial release.
