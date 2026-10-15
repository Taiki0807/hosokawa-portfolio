'use client'

import { useState, type ReactNode } from 'react'
import Segmented from '@/components/ui/Segmented'

type Panel = { id: string; tab: string; aside: ReactNode; content: ReactNode }

export default function ReviewTabs({ panels }: { panels: Panel[] }) {
  const [active, setActive] = useState(panels[0]?.id ?? '')
  const current = panels.find((p) => p.id === active) ?? panels[0]
  return (
    <>
      {panels.length > 1 ? (
        <Segmented
          label="レビューの目線"
          options={panels.map((p) => ({ value: p.id, label: p.tab }))}
          value={current.id}
          onChange={setActive}
          className="relative mt-2.5"
        />
      ) : null}
      <div
        role="tabpanel"
        aria-label={current.tab}
        className="relative mt-10 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10"
      >
        <div className="flex flex-none flex-row items-center gap-4 lg:sticky lg:top-[110px] lg:w-[190px] lg:flex-col lg:gap-3.5">
          {current.aside}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[22px]">{current.content}</div>
      </div>
    </>
  )
}
