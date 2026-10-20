import { expect, test } from './fixtures'

test('記録 → AI整形 → 確認 → 公開 → 公開ページに AI整形バッジ', async ({ page, ownerContext }) => {
  void ownerContext
  await page.goto('/admin/learning/new?date=2026-10-10')

  await page.getByLabel('タイトル').fill('VPC の設計を見直した')
  await page.getByLabel('タグ', { exact: true }).fill('AWS')
  await page.getByRole('button', { name: '60分' }).click()
  await page.getByLabel(/一言メモ/).fill('サブネットの切り方を整理した')
  await page
    .getByLabel(/^詳細ノート/)
    .fill('## 学んだこと\n\n> [!TIP]\n> ルートテーブルを先に決める')

  await page.getByRole('button', { name: 'AIで整える' }).first().click()
  const report = page.getByLabel('日報（編集できます）')
  await expect(report).toHaveValue(/【モック整形】/)

  // AI の文章は、確認のチェックを入れるまで公開できない
  const publish = page.getByRole('button', { name: '公開する' })
  await expect(publish).toBeDisabled()
  await page.getByLabel('AIが整えた文章を読み、入力した事実と合っていることを確認しました').check()
  await publish.click()
  await expect(page.getByText('公開しました。')).toBeVisible()

  await page.goto('/learning/2026-10-10')
  await expect(page.getByRole('heading', { name: 'VPC の設計を見直した' })).toBeVisible()
  await expect(page.getByText('AI整形')).toBeVisible()
  await expect(page.getByText(/【モック整形】/)).toBeVisible()
  await expect(page.getByText('ルートテーブルを先に決める')).toBeVisible()
})

test('下書きは公開ページに出ない', async ({ page, ownerContext }) => {
  void ownerContext
  await page.goto('/admin/learning/new?date=2026-10-11')
  await page.getByLabel('タグ', { exact: true }).fill('Docker')
  await page.getByRole('button', { name: '30分' }).click()
  await page.getByRole('button', { name: '下書き保存' }).click()
  await expect(page.getByText('下書きとして保存しました。')).toBeVisible()
  const res = await page.request.get('/learning/2026-10-11')
  expect(res.status()).toBe(404)
})

test('今日の記録があっても、日付を選んで過去の日の記録を書ける', async ({ page, ownerContext }) => {
  void ownerContext
  // 今日の記録を作る
  await page.goto('/admin/learning/new')
  await page.getByLabel('タグ', { exact: true }).fill('Portfolio')
  await page.getByRole('button', { name: '30分' }).click()
  await page.getByRole('button', { name: '下書き保存' }).click()
  await expect(page.getByText('下書きとして保存しました。')).toBeVisible()
  await expect(page).toHaveURL(/\/admin\/learning\/\d+$/)
  const todayUrl = page.url()

  // 「記録を書く」を開き直しても今日の編集には飛ばされず、すでにあることを案内する
  await page.goto('/admin/learning/new')
  await expect(page).toHaveURL(/\/admin\/learning\/new$/)
  await expect(page.getByText(/の記録はすでにあります/)).toBeVisible()
  await expect(page.getByRole('button', { name: '下書き保存' })).toBeDisabled()

  // 過去の日付を選ぶと書ける
  await page.getByLabel('日付').fill('2026-09-01')
  await expect(page.getByText(/の記録はすでにあります/)).toBeHidden()
  await page.getByLabel('タグ', { exact: true }).fill('AWS')
  await page.getByRole('button', { name: '60分' }).click()
  await page.getByRole('button', { name: '下書き保存' }).click()
  await expect(page.getByText('下書きとして保存しました。')).toBeVisible()
  await expect(page.getByRole('heading', { name: /2026年9月1日/ })).toBeVisible()
  expect(page.url()).not.toBe(todayUrl)

  // 未来の日付は保存できない
  await page.goto('/admin/learning/new?date=2026-09-02')
  await page.getByLabel('日付').fill('2099-01-01')
  await expect(page.getByText('未来の日付には記録できません。')).toBeVisible()
  await expect(page.getByRole('button', { name: '下書き保存' })).toBeDisabled()
})
