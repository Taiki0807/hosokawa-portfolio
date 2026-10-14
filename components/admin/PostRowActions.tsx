'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { setPostStatus } from '@/app/admin/works/actions'
import { btnGhost } from './ui'

export default function PostRowActions({
  id,
  status,
}: {
  id: number
  status: 'draft' | 'published'
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      className={btnGhost}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await setPostStatus({
            id,
            status: status === 'published' ? 'draft' : 'published',
          })
          if (res.ok) router.refresh()
          else alert(res.error)
        })
      }
    >
      {status === 'published' ? '非公開にする' : '公開する'}
    </button>
  )
}
