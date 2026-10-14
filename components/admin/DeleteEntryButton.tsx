'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { deleteEntry } from '@/app/admin/learning/actions'
import { btnDanger, btnGhost } from './ui'

export default function DeleteEntryButton({ id, label }: { id: number; label: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      <button
        type="button"
        className="text-danger-600 text-[13px] font-bold"
        onClick={() => dialogRef.current?.showModal()}
      >
        削除
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`del-${id}-title`}
        className="bg-surface-0 m-auto w-[min(440px,calc(100vw-32px))] rounded-3xl p-8 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] backdrop:bg-[rgba(16,14,24,0.55)]"
      >
        <div className="flex flex-col gap-4 text-left">
          <span
            className="text-danger-600 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#fde4e1]"
            aria-hidden="true"
          >
            !
          </span>
          <h2 id={`del-${id}-title`} className="text-ink-950 text-xl font-black">
            この記録を削除しますか？
          </h2>
          <p className="text-ink-700 text-sm leading-[1.8]">{label}</p>
          <p className="text-ink-600 text-xs leading-[1.8]">
            削除すると、草の色と連続記録にも反映されます。元に戻せません。
          </p>
          {error ? <p className="text-danger-600 text-xs font-bold">{error}</p> : null}
          <div className="mt-1.5 flex justify-end gap-2.5">
            <button
              type="button"
              className={btnGhost}
              onClick={() => dialogRef.current?.close()}
              autoFocus
            >
              キャンセル
            </button>
            <button
              type="button"
              className={btnDanger}
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await deleteEntry({ id })
                  if (!res.ok) return setError(res.error)
                  dialogRef.current?.close()
                  router.refresh()
                })
              }
            >
              {pending ? '削除しています…' : '削除する'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
