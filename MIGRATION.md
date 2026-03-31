# Migration Guide: v1 to v2

This guide covers all breaking changes when upgrading from `inoreader-js` v1.x to v2.0.

## 1. `AddSubscriptionParams`: field renamed

The `s` field has been renamed to `quickadd`. The optional `ac` and `t` fields have been removed as they are not part of the quickadd API endpoint.

```ts
// v1
const params: AddSubscriptionParams = {
  s: 'feed/https://example.com/rss',
  ac: 'subscribe',
  t: 'Example Feed',
}

// v2
const params: AddSubscriptionParams = {
  quickadd: 'feed/https://example.com/rss',
}
```

To set a title or tags after subscribing, use `editSubscription()` as a separate call.

## 2. `EditSubscriptionParams.ac`: enum values changed

The action values now match the Inoreader API specification.

| v1 | v2 |
|----|----|
| `'subscribe'` | `'follow'` |
| `'unsubscribe'` | `'unfollow'` |
| `'edit'` | `'edit'` (unchanged) |

```ts
// v1
await client.editSubscription({ s: streamId, ac: 'subscribe' })
await client.editSubscription({ s: streamId, ac: 'unsubscribe' })

// v2
await client.editSubscription({ s: streamId, ac: 'follow' })
await client.editSubscription({ s: streamId, ac: 'unfollow' })
```

## 3. `getStreamPreferences()` return type changed

The return type changed from `PreferenceList` to `StreamPreferenceList`, which has a different shape.

```ts
// v1 — PreferenceList
const result = await client.getStreamPreferences(streamId)
const prefs: Preference[] = result.prefs

// v2 — StreamPreferenceList
const result = await client.getStreamPreferences(streamId)
const prefs: Record<string, Preference[]> = result.streamprefs
// Access preferences for a specific stream:
const streamPrefs: Preference[] = result.streamprefs[streamId]
```

## 4. `STREAM_PARAMS.LATEST`: `r: 'n'` removed

The `r: 'n'` value was removed from `STREAM_PARAMS.LATEST` because `'n'` is not a valid API value. Per the Inoreader API, `r` is optional: omit it for newest-first (the default), or pass `'o'` for oldest-first. If you were referencing `STREAM_PARAMS.LATEST.r`, remove that usage. Use `STREAM_PARAMS.OLDEST` (which sets `r: 'o'`) when you need oldest-first ordering.

```ts
// v1
const { n, r } = STREAM_PARAMS.LATEST // { n: 20, r: 'n' }

// v2
const { n } = STREAM_PARAMS.LATEST    // { n: 20 } — newest-first by default
// For oldest-first:
STREAM_PARAMS.OLDEST                   // { r: 'o', n: 20 }
```