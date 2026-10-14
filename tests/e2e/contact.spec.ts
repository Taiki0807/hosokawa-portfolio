import { expect, test } from './fixtures'

test('お問い合わせは保存され、受信箱に表示される（メール送信に失敗しても成功扱い）', async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto('/#contact')
  await page.getByLabel('Name').fill('e2e 送信者')
  await page.getByLabel('Email').fill('sender@example.com')
  await page.getByLabel('Subject').fill('e2e からの問い合わせ')
  await page.getByLabel('Message').fill('テストのメッセージです。')
  await page.getByRole('button', { name: /Send message/i }).click()
  await expect(page.getByText('送信しました。ありがとうございます！')).toBeVisible()

  const ctx = await browser.newContext()
  const { signInAs } = await import('./fixtures')
  await signInAs(ctx, 'e2e-owner', baseURL!)
  const admin = await ctx.newPage()
  await admin.goto('/admin/inbox')
  await expect(admin.getByRole('heading', { name: 'e2e からの問い合わせ' })).toBeVisible()
  await expect(admin.getByText('通知メールの送信に失敗しました', { exact: false })).toBeVisible()
  await ctx.close()
})
