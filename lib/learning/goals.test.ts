import { describe, expect, it } from 'vitest'
import { certProgress, daysUntil, goalProgress, periodRange } from './goals'

describe('periodRange', () => {
  it('年', () => {
    expect(periodRange('yearly', '2026')).toEqual({ from: '2026-01-01', to: '2026-12-31' })
  })
  it('月（うるう年の 2 月・12 月）', () => {
    expect(periodRange('monthly', '2028-02')).toEqual({ from: '2028-02-01', to: '2028-02-29' })
    expect(periodRange('monthly', '2027-02').to).toBe('2027-02-28')
    expect(periodRange('monthly', '2026-12').to).toBe('2026-12-31')
  })
  it('形式が違えばエラー', () => {
    expect(() => periodRange('monthly', '2026-13')).toThrow()
    expect(() => periodRange('yearly', '26')).toThrow()
  })
})

describe('goalProgress', () => {
  const days = [
    { date: '2026-09-30', tag: 'AWS', minutes: 60 },
    { date: '2026-10-01', tag: 'AWS', minutes: 60 },
    { date: '2026-10-01', tag: 'Next.js', minutes: 30 },
    { date: '2026-10-02', tag: 'Next.js', minutes: 30 },
    { date: '2026-10-03', tag: 'AWS', minutes: 0 },
  ]

  it('学習日数（自動）は期間内の学習した日だけ数える', () => {
    const p = goalProgress(
      {
        kind: 'monthly',
        period: '2026-10',
        target: 20,
        source: 'auto:studyDays',
        manualValue: null,
        studyTags: [],
      },
      days
    )
    expect(p).toEqual({ current: 2, target: 20, percent: 10 })
  })

  it('学習時間（自動）は時間に換算', () => {
    const p = goalProgress(
      {
        kind: 'yearly',
        period: '2026',
        target: 30,
        source: 'auto:studyHours',
        manualValue: null,
        studyTags: [],
      },
      days
    )
    expect(p.current).toBe(3)
    expect(p.percent).toBe(10)
  })

  it('対象タグを決めたら、そのタグの時間・日数だけ数える', () => {
    const base = { kind: 'monthly', period: '2026-10', target: 10, manualValue: null } as const
    expect(
      goalProgress({ ...base, source: 'auto:studyHours', studyTags: ['AWS'] }, days).current
    ).toBe(1)
    expect(
      goalProgress({ ...base, source: 'auto:studyDays', studyTags: ['Next.js'] }, days).current
    ).toBe(2)
    expect(
      goalProgress({ ...base, source: 'auto:studyHours', studyTags: ['Kaggle'] }, days).current
    ).toBe(0)
  })

  it('手入力は manualValue を使い、未入力なら 0', () => {
    expect(
      goalProgress(
        {
          kind: 'yearly',
          period: '2026',
          target: 12,
          source: 'manual',
          manualValue: 7,
          studyTags: [],
        },
        days
      ).percent
    ).toBe(58)
    expect(
      goalProgress(
        {
          kind: 'yearly',
          period: '2026',
          target: 12,
          source: 'manual',
          manualValue: null,
          studyTags: [],
        },
        days
      ).current
    ).toBe(0)
  })

  it('100% を超えない・目標 0 なら 0%', () => {
    expect(
      goalProgress(
        {
          kind: 'yearly',
          period: '2026',
          target: 1,
          source: 'manual',
          manualValue: 5,
          studyTags: [],
        },
        days
      ).percent
    ).toBe(100)
    expect(
      goalProgress(
        {
          kind: 'yearly',
          period: '2026',
          target: 0,
          source: 'manual',
          manualValue: 5,
          studyTags: [],
        },
        days
      ).percent
    ).toBe(0)
  })
})

describe('daysUntil', () => {
  it('残り日数（当日 0、過ぎたら負）', () => {
    expect(daysUntil('2027-01-24', '2026-10-15')).toBe(101)
    expect(daysUntil('2026-10-15', '2026-10-15')).toBe(0)
    expect(daysUntil('2026-10-14', '2026-10-15')).toBe(-1)
  })
})

describe('certProgress', () => {
  const sessions = [
    { date: '2026-09-20', tag: 'AWS', minutes: 120 },
    { date: '2026-10-01', tag: 'AWS', minutes: 60 },
    { date: '2026-10-02', tag: 'Next.js', minutes: 60 },
    { date: '2026-10-03', tag: '資格対策', minutes: 60 },
  ]

  it('自動：対象タグの累計 / 目標時間、今月分も出す', () => {
    const p = certProgress(
      {
        progressMode: 'auto',
        manualProgress: null,
        studyTags: ['AWS', '資格対策'],
        targetHours: 10,
      },
      sessions,
      '2026-10-15'
    )
    expect(p).toEqual({ percent: 40, monthMinutes: 120, totalMinutes: 240 })
  })

  it('自動で目標時間が未設定なら進捗は null', () => {
    expect(
      certProgress(
        { progressMode: 'auto', manualProgress: null, studyTags: ['AWS'], targetHours: null },
        sessions,
        '2026-10-15'
      ).percent
    ).toBeNull()
  })

  it('手入力', () => {
    expect(
      certProgress(
        { progressMode: 'manual', manualProgress: 45, studyTags: [], targetHours: null },
        sessions,
        '2026-10-15'
      ).percent
    ).toBe(45)
  })
})
