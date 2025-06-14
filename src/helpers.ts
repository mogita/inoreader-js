import type { InoreaderClient } from './client'
import type { StreamContents, Article, StreamParams } from './types'

/**
 * Helper functions for common Inoreader operations
 */

/**
 * Fetches all articles from a stream with automatic pagination
 */
export async function fetchAllArticles(
  client: InoreaderClient,
  streamId: string,
  params?: StreamParams & { maxArticles?: number },
): Promise<Article[]> {
  const articles: Article[] = []
  const maxArticles = params?.maxArticles || 1000
  let continuation: string | undefined

  const requestParams = { ...params }
  delete requestParams.maxArticles

  do {
    const stream = await client.getStreamContents(streamId, {
      ...requestParams,
      c: continuation,
    })

    articles.push(...stream.items)
    continuation = stream.continuation

    // Stop if we've reached the max articles limit
    if (articles.length >= maxArticles) {
      break
    }

    // Stop if no more articles
    if (!continuation || stream.items.length === 0) {
      break
    }
  } while (continuation)

  return articles.slice(0, maxArticles)
}

/**
 * Fetches unread articles from all subscriptions
 */
export async function fetchUnreadArticles(
  client: InoreaderClient,
  params?: StreamParams & { maxArticles?: number },
): Promise<Article[]> {
  return fetchAllArticles(client, 'user/-/state/com.google/reading-list', {
    ...params,
    xt: 'user/-/state/com.google/read', // Exclude read articles
  })
}

/**
 * Fetches starred articles
 */
export async function fetchStarredArticles(
  client: InoreaderClient,
  params?: StreamParams & { maxArticles?: number },
): Promise<Article[]> {
  return fetchAllArticles(client, 'user/-/state/com.google/starred', params)
}

/**
 * Fetches articles from a specific feed
 */
export async function fetchFeedArticles(
  client: InoreaderClient,
  feedUrl: string,
  params?: StreamParams & { maxArticles?: number },
): Promise<Article[]> {
  const streamId = `feed/${feedUrl}`
  return fetchAllArticles(client, streamId, params)
}

/**
 * Fetches articles with a specific tag/label
 */
export async function fetchTaggedArticles(
  client: InoreaderClient,
  tagName: string,
  params?: StreamParams & { maxArticles?: number },
): Promise<Article[]> {
  const streamId = `user/-/label/${tagName}`
  return fetchAllArticles(client, streamId, params)
}
