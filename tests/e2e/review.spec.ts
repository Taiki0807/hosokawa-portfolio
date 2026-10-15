import { expect, test } from './fixtures'

test('AIレビューを作り、選んだものだけ公開すると、注意書きつきでホームに出る', async ({
  page,
  ownerContext,
}) => {
  void ownerContext
  await page.goto('/admin/review?persona=boss')
  await page.getByRole('button', { name: 'AIで評価を作る' }).click()
  await expect(page.getByRole('heading', { name: '生成されたコメント案' })).toBeVisible()

  await page.getByRole('switch', { name: /継続して学習している/ }).click()
  await page.getByRole('switch', { name: /説明する機会を増やす/ }).click()
  await page.getByRole('button', { name: '選んだコメントを公開' }).click()
  await expect(page.getByText('2件を公開しました。')).toBeVisible()

  await page.goto('/#review')
  const review = page.locator('#review')
  await expect(review.getByText('【モック】継続して学習している')).toBeVisible()
  await expect(review.getByText('【モック】手を動かして確かめている')).toHaveCount(0)
  await expect(review.getByText('AIが作成')).toBeVisible()
  await expect(review.getByText('実在の上司の発言ではありません')).toBeVisible()
  await expect(review.getByText(/本人が確認して公開/)).toBeVisible()
})
