import { LEARNING_DOMAINS, OTHER_DOMAIN, type LearningDomain } from '@/config/learning-domains'
import type { IsoDate } from './date'
import type { SessionRecord } from './goals'

export type TagTotal = { tag: string; minutes: number }

/** 期間内のタグ別学習時間（多い順） */
export function tagTotals(sessions: SessionRecord[], from: IsoDate, to: IsoDate): TagTotal[] {
  const map = new Map<string, number>()
  for (const s of sessions) {
    if (s.date < from || s.date > to || !(s.minutes > 0)) continue
    map.set(s.tag, (map.get(s.tag) ?? 0) + s.minutes)
  }
  return [...map.entries()]
    .map(([tag, minutes]) => ({ tag, minutes }))
    .sort((a, b) => b.minutes - a.minutes || a.tag.localeCompare(b.tag))
}

export type DomainTotal = { domain: LearningDomain; minutes: number; ratio: number }

export function domainBreakdown(
  totals: TagTotal[],
  domains: LearningDomain[] = LEARNING_DOMAINS
): DomainTotal[] {
  const byTag = new Map<string, LearningDomain>()
  for (const d of domains) for (const t of d.tags) byTag.set(t, d)

  const sums = new Map<string, number>()
  for (const { tag, minutes } of totals) {
    const id = (byTag.get(tag) ?? OTHER_DOMAIN).id
    sums.set(id, (sums.get(id) ?? 0) + minutes)
  }
  const all = [...sums.values()].reduce((a, b) => a + b, 0)
  return [...domains, OTHER_DOMAIN]
    .map((domain) => {
      const minutes = sums.get(domain.id) ?? 0
      return { domain, minutes, ratio: all > 0 ? minutes / all : 0 }
    })
    .filter((d) => d.domain.id !== OTHER_DOMAIN.id || d.minutes > 0)
}
