'use client'

import { useEffect, useRef, type KeyboardEvent } from 'react'
import { addDays, formatDateJa } from '@/lib/learning/date'
import type { ExplorerCell, ExplorerData } from './types'

const LEVEL_BG = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4'] as const

const CELL = 17
const GAP = 4

type Props = {
  weeks: ExplorerData['weeks']
  months: ExplorerData['months']
  selected: string
  onSelect: (date: string) => void
}

function describe(cell: ExplorerCell) {
  const minutes = cell.minutes > 0 ? `${cell.minutes}分` : '記録なし'
  return [formatDateJa(cell.date), minutes, ...cell.tags].join(' ・ ')
}

export default function Heatmap({ weeks, months, selected, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const byDate = new Map(weeks.flat().map((c) => [c.date, c]))

  // 狭い画面では最新（右端）が見えるようにする
  useEffect(() => {
    const el = scrollRef.current
    if (el && el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth
  }, [])

  // ← → で 1 週、↑ ↓ で 1 日移動（ロービング tabindex）
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const delta = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }[e.key]
    if (!delta) return
    e.preventDefault()
    const next = byDate.get(addDays(selected, delta))
    if (!next?.inRange) return
    onSelect(next.date)
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${next.date}"]`)?.focus()
  }

  const width = weeks.length * CELL + (weeks.length - 1) * GAP

  return (
    <div ref={scrollRef} className="relative -mx-2 overflow-x-auto px-2 pt-10 pb-2">
      <div style={{ width: width + 36 }}>
        <div className="mb-2 flex gap-3" aria-hidden="true">
          <div className="w-6 flex-none" />
          <div
            className="text-ink-inverse-400 grid text-xs font-bold whitespace-nowrap"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, ${CELL}px)`, columnGap: GAP }}
          >
            {months.map((m) => (
              <div key={`${m.col}-${m.label}`} style={{ gridColumn: m.col + 1 }}>
                {m.label}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <div
            aria-hidden="true"
            className="text-ink-inverse-400 grid w-6 flex-none text-[11px] leading-[17px] font-bold"
            style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, rowGap: GAP }}
          >
            <span />
            <span>月</span>
            <span />
            <span>水</span>
            <span />
            <span>金</span>
            <span />
          </div>
          <div
            ref={gridRef}
            role="group"
            aria-label="過去1年の学習ヒートマップ。矢印キーで日付を移動できます"
            onKeyDown={onKeyDown}
            className="grid grid-flow-col"
            style={{
              gridTemplateRows: `repeat(7, ${CELL}px)`,
              gridAutoColumns: `${CELL}px`,
              gap: GAP,
            }}
          >
            {weeks
              .flatMap((week, col) =>
                week.map((cell) => ({
                  cell,
                  tipClass: col < 8 ? 'hm-tip-start' : col >= weeks.length - 8 ? 'hm-tip-end' : '',
                }))
              )
              .map(({ cell, tipClass }) =>
                cell.inRange ? (
                  <button
                    key={cell.date}
                    type="button"
                    data-date={cell.date}
                    tabIndex={cell.date === selected ? 0 : -1}
                    aria-label={describe(cell)}
                    aria-pressed={cell.date === selected}
                    onClick={() => onSelect(cell.date)}
                    className={`hm-cell relative h-[17px] w-[17px] cursor-pointer rounded-[5px] focus-visible:outline-none ${LEVEL_BG[cell.level]} ${
                      cell.date === selected ? 'shadow-[0_0_0_2px_#f5f4fb]' : ''
                    }`}
                  >
                    <span className={`hm-tip ${tipClass}`} aria-hidden="true">
                      {describe(cell)}
                    </span>
                  </button>
                ) : (
                  <span key={cell.date} aria-hidden="true" className="h-[17px] w-[17px]" />
                )
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
