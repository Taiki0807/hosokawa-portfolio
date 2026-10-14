import { expect, signInAs, test } from './fixtures'

test('未ログインでは管理画面に入れず、ログイン画面へ戻される', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin/)
  await expect(page.getByRole('heading', { name: '管理者ログイン' })).toBeVisible()
})

test('未ログインでは管理用 API に 401', async ({ request }) => {
  expect((await request.get('/api/admin/summary')).status()).toBe(401)
  expect((await request.get('/api/admin/export?format=json')).status()).toBe(401)
})

test('許可リストにないアカウントは 403 画面へ', async ({ page, context, baseURL }) => {
  await signInAs(context, 'visitor-123', baseURL!)
  await page.goto('/admin/learning')
  await expect(page).toHaveURL(/\/forbidden/)
  await expect(page.getByText('このアカウントには管理権限がありません')).toBeVisible()
  expect((await page.request.get('/api/admin/summary')).status()).toBe(403)
})

test('オーナーは管理画面に入れる', async ({ page, ownerContext }) => {
  void ownerContext
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: /おかえりなさい/ })).toBeVisible()
})
