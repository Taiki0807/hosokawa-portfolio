import 'server-only'
import type { AiProvider } from './types'
import { anthropicProvider } from './anthropic'
import { mockProvider } from './mock'

/** AI_PROVIDER=mock はローカル・e2e 専用。Vercel 上では必ず本物を使う */
export function getAiProvider(): AiProvider {
  if (process.env.AI_PROVIDER === 'mock' && !process.env.VERCEL) return mockProvider
  return anthropicProvider
}

export { AiError } from './types'
