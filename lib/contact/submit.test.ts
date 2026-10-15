import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTestDb } from '@/tests/helpers/test-db'
import { contactMessages } from '@/lib/db/schema'
import { submitContact } from './submit'
import { escapeHtml } from './schema'
import type { Db } from '@/lib/db/client'

let db: Db
beforeEach(() => {
  db = useTestDb()
})

const valid = { name: '山田', email: 'a@example.com', subject: '相談', message: 'こんにちは' }

describe('submitContact', () => {
  it('保存して通知する', async () => {
    const notify = vi.fn().mockResolvedValue({ ok: true })
    const res = await submitContact(valid, 'k', notify)
    expect(res.status).toBe(200)
    const rows = await db.select().from(contactMessages)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ status: 'open', mailStatus: 'sent' })
  })

  it('メール送信に失敗しても保存は成功扱いで、失敗を記録する', async () => {
    const notify = vi.fn().mockResolvedValue({ ok: false, error: 'domain not verified' })
    const res = await submitContact(valid, 'k', notify)
    expect(res.status).toBe(200)
    const [row] = await db.select().from(contactMessages)
    expect(row).toMatchObject({ mailStatus: 'failed', mailError: 'domain not verified' })
  })

  it('通知が例外を投げても保存は成功扱い', async () => {
    const res = await submitContact(valid, 'k', vi.fn().mockRejectedValue(new Error('network')))
    expect(res.status).toBe(200)
    expect((await db.select().from(contactMessages))[0].mailStatus).toBe('failed')
  })

  it('入力が不正なら 400 で保存しない', async () => {
    const res = await submitContact({ ...valid, email: 'not-an-email' }, 'k', vi.fn())
    expect(res.status).toBe(400)
    expect(await db.select().from(contactMessages)).toHaveLength(0)
  })

  it('ハニーポットに入力があれば、成功に見せて保存も通知もしない', async () => {
    const notify = vi.fn()
    const res = await submitContact({ ...valid, website: 'http://spam' }, 'k', notify)
    expect(res.status).toBe(200)
    expect(notify).not.toHaveBeenCalled()
    expect(await db.select().from(contactMessages)).toHaveLength(0)
  })

  it('同じ送信元からは 1 時間に 5 回まで', async () => {
    const notify = vi.fn().mockResolvedValue({ ok: true })
    const statuses = []
    for (let i = 0; i < 6; i++) statuses.push((await submitContact(valid, 'same', notify)).status)
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429])
  })
})

describe('escapeHtml', () => {
  it('HTML として解釈される文字をエスケープする', () => {
    expect(escapeHtml('<img src=x onerror="a">&\'')).toBe(
      '&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;'
    )
  })
})
