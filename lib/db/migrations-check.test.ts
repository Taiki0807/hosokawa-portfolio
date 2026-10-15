import { describe, expect, it } from 'vitest'
import journal from '../../drizzle/meta/_journal.json'
import { findMissingMigrations } from './migrations-check'

describe('findMissingMigrations', () => {
  const whens = journal.entries.map((e) => e.when)

  it('すべて適用済みなら空', () => {
    expect(findMissingMigrations(journal, whens)).toEqual([])
  })

  it('最後の 1 件が未適用ならそれを返す', () => {
    const last = journal.entries.at(-1)!
    expect(findMissingMigrations(journal, whens.slice(0, -1))).toEqual([last.tag])
  })

  it('何も適用されていなければ全件', () => {
    expect(findMissingMigrations(journal, [])).toHaveLength(journal.entries.length)
  })
})
