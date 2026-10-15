import 'server-only'
import type { AiProvider } from './types'
import { anthropicProvider } from './anthropic'
import { mockProvider } from './mock'
import { openaiProvider } from './openai'

/**
 * AI_PROVIDER=openai（既定）| anthropic | mock
 * mock はローカル・e2e 専用。Vercel 上では必ず本物を使う
 */
export function getAiProvider(): AiProvider {
  const name = process.env.AI_PROVIDER
  if (name === 'mock' && !process.env.VERCEL) return mockProvider
  if (name === 'anthropic') return anthropicProvider
  return openaiProvider
}

export { AiError } from './types'
