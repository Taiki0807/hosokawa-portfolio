import { expect, test } from './fixtures'

test('URL 名にリンクを入れても案内に従って保存でき、公開ページにリンクのボタンが出る', async ({
  page,
  ownerContext,
}) => {
  void ownerContext
  const slug = `e2e-work-${Date.now()}`
  await page.goto('/admin/works/new?kind=project')
  await page.getByPlaceholder('タイトル').fill('E2E の成果物')

  const slugInput = page.getByLabel(/ページの URL 名/)
  await slugInput.fill('https://example.com/e2e')
  await expect(page.getByText('外部サイトの URL は「リンク」欄に入れます')).toBeVisible()
  await page.getByRole('button', { name: 'リンク欄に移す' }).click()
  await expect(page.getByLabel(/^リンク/)).toHaveValue('https://example.com/e2e')

  await slugInput.fill(slug)
  await page.getByLabel('または絵文字').fill('🎮')
  await page.getByRole('button', { name: '下書き保存' }).click()
  await expect(page.getByText('下書きとして保存しました。')).toBeVisible()

  await page.getByRole('button', { name: '公開する' }).click()
  await expect(page.getByText('公開しました。')).toBeVisible()

  await page.goto(`/projects/${slug}`)
  const link = page.getByRole('link', { name: /サイトを見る/ })
  await expect(link).toHaveAttribute('href', 'https://example.com/e2e')

  // ホームの Featured project に、入れたアイコンで出る
  await page.goto('/')
  const card = page.locator('#projects a', { hasText: 'E2E の成果物' })
  await expect(card.getByText('🎮')).toBeVisible()
})
