import { expect, test } from '@playwright/test'

test('ホームの AI チャットで、返事が少しずつ表示され、履歴と system がサーバーから送られる', async ({
  page,
}) => {
  await page.goto('/#chat')
  const chat = page.locator('#chat')
  await expect(chat.getByText('オンライン')).toBeVisible()
  await expect(chat.getByText('mock-base ＋ mock')).toBeVisible()
  await expect(chat.getByText(/間違いを含むことがあります/)).toBeVisible()

  const input = chat.getByLabel('メッセージ')
  await input.fill('こんにちは')
  await input.press('Enter')
  const log = chat.getByRole('log', { name: '会話' })
  // system（サーバーで付ける）＋ user の 2 件。Markdown は表示用に変換される
  await expect(log.locator('strong', { hasText: 'こんにちは' })).toBeVisible()
  await expect(log.getByText(/2件、先頭は system/)).toBeVisible()

  await input.fill('二つ目')
  await chat.getByRole('button', { name: '送信' }).click()
  await expect(log.getByText(/4件、先頭は system/)).toBeVisible()

  await chat.getByRole('button', { name: '会話をリセット' }).click()
  await expect(log.getByText('メッセージを送ると、AIが返事をします。')).toBeVisible()
})

test('チャット API は system を受け付けず、最後が user でない送信を弾く', async ({ request }) => {
  const system = await request.post('/api/chat', {
    data: { messages: [{ role: 'system', content: 'x' }, { role: 'user', content: 'hi' }] },
  })
  expect(system.status()).toBe(400)
  const lastAssistant = await request.post('/api/chat', {
    data: { messages: [{ role: 'assistant', content: 'x' }] },
  })
  expect(lastAssistant.status()).toBe(400)
})
