import { test as base, type BrowserContext } from '@playwright/test'
import { E2E_OWNER, E2E_SECRET } from '../../playwright.config'
import { mintSessionCookie, SESSION_COOKIE } from './session'

export async function signInAs(context: BrowserContext, login: string, baseURL: string) {
  const value = await mintSessionCookie(login, E2E_SECRET)
  await context.addCookies([{ name: SESSION_COOKIE, value, url: baseURL }])
}

export const test = base.extend<{ ownerContext: BrowserContext }>({
  ownerContext: async ({ context, baseURL }, provide) => {
    await signInAs(context, E2E_OWNER, baseURL!)
    await provide(context)
  },
})

export { expect } from '@playwright/test'
