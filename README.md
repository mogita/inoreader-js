# InoreaderJS

A TypeScript library for the Inoreader API with OAuth 2.0 and ClientLogin support. This library is not affiliated with or maintained by Inoreader.

## Features

- 🚀 **Multi-Runtime Support**: Tested with Node.js, Bun, and Deno
- 📦 **Module Support**: ESM and CommonJS builds
- 🌐 **Universal**: Works in browsers and server-side environments
- 🤞 **Promise-based**: Modern async/await API
- 🧩 **All Endpoints**: Full coverage of Inoreader API endpoints
- 🔐 **Authentication**: OAuth 2.0 and legacy ClientLogin (App authentication) support
- 🚦 **Rate Limiting**: Built-in rate limit tracking
- 🚩 **Error Handling**: Comprehensive error classes

## Installation

```bash
npm install inoreader-js

# or with yarn
yarn add inoreader-js

# or with pnpm
pnpm add inoreader-js

# or with bun
bun add inoreader-js
```

## Quick Start

First, register your app at the [Inoreader Developer Console](https://www.inoreader.com/developers/register-app) to get your client credentials.

```typescript
import { InoreaderClient, AuthenticationError } from 'inoreader-js'

/**
 * Simple Inoreader usage example
 * Demonstrates: authentication, fetching articles by tag, and marking as read
 */
async function quickStartExample() {
  // Create client and authenticate
  const client = new InoreaderClient({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    redirectUri: 'https://your-app.com/callback',
  })

  try {
    // Generate authorization URL (user visits this to authorize)
    const authUrl = client.generateAuthUrl('read write', 'csrf-state')
    console.log('Visit this URL to authorize:', authUrl)

    // Exchange authorization code for tokens (after user authorizes)
    const authCode = 'authorization-code-from-callback'
    await client.exchangeCodeForToken(authCode)
    console.log('Authentication successful!')

    // Fetch articles from a specific tag (e.g., "Technology")
    const tagStream = await client.getStreamContents('user/-/label/Technology', {
      n: 10, // Get 10 articles
      xt: 'user/-/state/com.google/read', // Exclude already read
    })

    console.log(`Found ${tagStream.items.length} unread articles in "Technology" tag:`)
    tagStream.items.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title} (${article.origin.title})`)
    })

    // Mark the first article in the tag as read
    if (tagStream.items.length > 0) {
      await client.editTag({
        i: tagStream.items[0].id,
        a: 'user/-/state/com.google/read',
      })

      console.log(`Marked "${tagStream.items[0].title}" <${tagStream.items[0].id}> as read`)
    } else {
      console.log('No articles to mark as read')
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.error('Authentication failed:', error.message)
    } else {
      console.error('Error:', error)
    }
  }
}

// Run the example
quickStartExample().catch(console.error)
```

## Legacy Authentication

For legacy applications, you can use ClientLogin:

```typescript
const client = new InoreaderClient()

await client.clientLogin({
  email: 'your-email@example.com',
  password: 'your-password'
})

const userInfo = await client.getUserInfo()
```

## Error Handling

InoreaderJS 

```typescript
import { AuthenticationError, RateLimitError } from 'inoreader-js'

try {
  await client.getUserInfo()
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.log('Authentication failed:', error.message)
  } else if (error instanceof RateLimitError) {
    console.log('Rate limited, retry after:', error.resetAfter)
  }
}
```

## Development

This library is developed and tested with [Bun 1.2](https://bun.sh/).

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build for production
bun run build
```

## Contributing

Contributions are welcome! Should you find any issues or have any suggestions, kindly submit an issue or PR with the provided templates. Thank you!

## License

MIT © [mogita](https://github.com/mogita)
