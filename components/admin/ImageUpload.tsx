'use client'

/* eslint-disable @next/next/no-img-element */
import { useId, useState } from 'react'
import { confirmImageUpload, requestImageUpload } from '@/app/admin/uploads-actions'
import { ALLOWED_IMAGE_TYPES, validateImageUpload } from '@/lib/upload-rules'

type Props = {
  value: string
  onChange: (url: string) => void
  prefix: 'badges' | 'posts'
  label: string
}

/** R2 へ署名付き URL で直接アップロードする（前後でサーバー側の確認あり） */
export default function ImageUpload({ value, onChange, prefix, label }: Props) {
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async (file: File) => {
    setError(null)
    const check = validateImageUpload(file.type, file.size)
    if (!check.ok) return setError(check.error)
    setBusy(true)
    try {
      const signed = await requestImageUpload({ contentType: file.type, size: file.size, prefix })
      if (!signed.ok) throw new Error(signed.error)
      const put = await fetch(signed.data.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!put.ok) throw new Error('アップロードに失敗しました')
      const confirmed = await confirmImageUpload({ key: signed.data.key })
      if (!confirmed.ok) throw new Error(confirmed.error)
      onChange(confirmed.data.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex w-[120px] flex-none flex-col items-center gap-2">
      <label
        htmlFor={id}
        className="border-brand-200 text-ink-600 focus-within:outline-brand-500 flex h-[104px] w-[104px] cursor-pointer items-center justify-center overflow-hidden rounded-full border-[1.5px] border-dashed bg-white text-center text-xs font-bold focus-within:outline-2"
      >
        {value ? (
          <img src={value} alt="" className="h-[84%] w-[84%] object-contain" />
        ) : busy ? (
          'アップロード中…'
        ) : (
          <>
            画像を
            <br />
            追加
          </>
        )}
        <input
          id={id}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          className="sr-only"
          aria-label={label}
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void upload(f)
            e.target.value = ''
          }}
        />
      </label>
      <span className="text-ink-600 text-[11px] font-bold">{label}</span>
      {value ? (
        <button
          type="button"
          className="text-danger-600 text-[11px] font-bold"
          onClick={() => onChange('')}
        >
          画像を外す
        </button>
      ) : null}
      {error ? <p className="text-danger-600 text-center text-[11px] font-bold">{error}</p> : null}
    </div>
  )
}
