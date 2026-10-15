'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import NoteMarkdown from '@/components/learning/NoteMarkdown'
import { deletePost, savePost } from '@/app/admin/works/actions'
import type { PostKind } from '@/lib/db/schema'
import { normalizeSlug } from '@/lib/admin/post-schema'
import ImageUpload from './ImageUpload'
import { FieldError, Notice, btnGhost, btnPrimary, cardClass, inputClass, labelClass } from './ui'

export type PostDraft = {
  id?: number
  kind: PostKind
  slug: string
  title: string
  category: string
  excerpt: string
  tags: string
  bodyMd: string
  linkLabel: string
  linkHref: string
  status: 'draft' | 'published'
}

const KIND_LABEL: Record<PostKind, string> = {
  project: '成果物',
  blog: 'ブログ',
  'css-note': 'CSSノート',
}

const PATH_PREFIX: Record<PostKind, string> = {
  project: '/projects/',
  blog: '/blog/',
  'css-note': '/css-notes/',
}

const looksLikeUrl = (v: string) => /^https?:\/\//i.test(v.trim())

const SNIPPETS = {
  heading: '\n## 見出し\n',
  list: '\n- 項目\n- 項目\n',
  callout: '\n> [!TIP]\n> ここに補足を書きます\n',
  code: '\n```ts\nconst example = true\n```\n',
  link: '[リンクの文字](https://)',
}

export default function PostEditor({ initial }: { initial: PostDraft }) {
  const router = useRouter()
  const [v, setV] = useState(initial)
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const insert = (text: string) => {
    const el = bodyRef.current
    const start = el?.selectionStart ?? v.bodyMd.length
    const end = el?.selectionEnd ?? v.bodyMd.length
    const next = v.bodyMd.slice(0, start) + text + v.bodyMd.slice(end)
    setV((x) => ({ ...x, bodyMd: next }))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + text.length, start + text.length)
    })
  }

  const save = (intent: 'draft' | 'publish') =>
    start(async () => {
      const res = await savePost({
        id: v.id,
        kind: v.kind,
        slug: v.slug,
        title: v.title,
        category: v.category,
        excerpt: v.excerpt,
        tags: v.tags
          .split(/[,、]/)
          .map((t) => t.trim())
          .filter(Boolean),
        bodyMd: v.bodyMd,
        linkLabel: v.linkLabel,
        linkHref: v.linkHref,
        intent,
      })
      setErrors(res.ok ? {} : (res.fieldErrors ?? {}))
      if (!res.ok) return setMessage({ tone: 'error', text: res.error })
      setV((x) => ({ ...x, id: res.data.id, status: res.data.status }))
      setMessage({
        tone: 'success',
        text: res.data.status === 'published' ? '公開しました。' : '下書きとして保存しました。',
      })
      if (!v.id) router.replace(`/admin/works/${res.data.id}`)
      router.refresh()
    })

  const readMin = Math.max(1, Math.ceil(v.bodyMd.length / 500))
  const tags = v.tags
    .split(/[,、]/)
    .map((t) => t.trim())
    .filter(Boolean)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/works" className="text-brand-500 text-[13px] font-bold">
          ← 成果物・ブログに戻る
        </Link>
        <div className="flex gap-2.5">
          <button
            type="button"
            className={btnGhost}
            disabled={pending}
            onClick={() => save('draft')}
          >
            下書き保存
          </button>
          <button
            type="button"
            className={btnPrimary}
            disabled={pending}
            onClick={() => save('publish')}
          >
            {v.status === 'published' ? '更新する' : '公開する'}
          </button>
        </div>
      </div>
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

      <section className={`${cardClass} grid gap-4 p-6 sm:grid-cols-2 sm:p-7 lg:grid-cols-4`}>
        <h2 className="text-ink-950 text-sm font-black sm:col-span-2 lg:col-span-4">
          記事の設定（{KIND_LABEL[v.kind]}）
        </h2>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="pe-slug">
            ページの URL 名（スラッグ）{' '}
            <span className="text-ink-600 font-medium">（半角英小文字・数字・ハイフン）</span>
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-ink-600 shrink-0 font-mono text-xs">{PATH_PREFIX[v.kind]}</span>
            <input
              id="pe-slug"
              className={inputClass}
              placeholder="tsumi-note"
              aria-describedby="pe-slug-hint"
              value={v.slug}
              onChange={(e) => setV((x) => ({ ...x, slug: normalizeSlug(e.target.value) }))}
            />
          </div>
          {looksLikeUrl(v.slug) ? (
            <p id="pe-slug-hint" className="text-danger-600 mt-1.5 text-xs leading-[1.7]">
              ここはこのサイト内のページの名前です。外部サイトの URL は「リンク」欄に入れます。{' '}
              <button
                type="button"
                className="text-brand-500 font-bold underline"
                onClick={() =>
                  setV((x) => ({
                    ...x,
                    linkHref: x.linkHref || x.slug.trim(),
                    slug: '',
                  }))
                }
              >
                リンク欄に移す
              </button>
            </p>
          ) : (
            <p id="pe-slug-hint" className="text-ink-600 mt-1.5 text-xs">
              このページの URL になります：{PATH_PREFIX[v.kind]}
              {v.slug || '…'}
            </p>
          )}
          <FieldError message={errors.slug} />
        </div>
        <div>
          <label className={labelClass} htmlFor="pe-cat">
            カテゴリ
          </label>
          <input
            id="pe-cat"
            className={inputClass}
            value={v.category}
            onChange={(e) => setV((x) => ({ ...x, category: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="pe-tags">
            タグ <span className="text-ink-600 font-medium">（カンマ区切り）</span>
          </label>
          <input
            id="pe-tags"
            className={inputClass}
            value={v.tags}
            onChange={(e) => setV((x) => ({ ...x, tags: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <label className={labelClass} htmlFor="pe-excerpt">
            説明文{' '}
            <span className="text-ink-600 font-medium">
              （一覧に表示。AIレビューの根拠にも使います）
            </span>
          </label>
          <input
            id="pe-excerpt"
            className={inputClass}
            value={v.excerpt}
            onChange={(e) => setV((x) => ({ ...x, excerpt: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className={labelClass} htmlFor="pe-link-href">
            リンク{' '}
            <span className="text-ink-600 font-medium">
              （任意。公開先のサイトや GitHub など。ページ上部にボタンで表示します）
            </span>
          </label>
          <input
            id="pe-link-href"
            className={inputClass}
            placeholder="https://"
            value={v.linkHref}
            onChange={(e) => setV((x) => ({ ...x, linkHref: e.target.value }))}
          />
          <FieldError message={errors.linkHref} />
        </div>
        <div>
          <label className={labelClass} htmlFor="pe-link-label">
            ボタンの文字
          </label>
          <input
            id="pe-link-label"
            className={inputClass}
            placeholder="サイトを見る"
            value={v.linkLabel}
            onChange={(e) => setV((x) => ({ ...x, linkLabel: e.target.value }))}
          />
          <FieldError message={errors.linkLabel} />
        </div>
        <p className="text-ink-600 text-xs sm:col-span-2 lg:col-span-4">
          読了時間は本文の文字数から自動で計算されます（約{readMin}分）。
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={`${cardClass} flex flex-col gap-4 p-6`}>
          <label className="sr-only" htmlFor="pe-title">
            タイトル
          </label>
          <input
            id="pe-title"
            placeholder="タイトル"
            className={`${inputClass} text-xl font-black`}
            value={v.title}
            onChange={(e) => setV((x) => ({ ...x, title: e.target.value }))}
          />
          <FieldError message={errors.title} />
          <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="挿入">
            <button type="button" className={btnGhost} onClick={() => insert(SNIPPETS.heading)}>
              見出し
            </button>
            <button type="button" className={btnGhost} onClick={() => insert(SNIPPETS.list)}>
              リスト
            </button>
            <button type="button" className={btnGhost} onClick={() => insert(SNIPPETS.callout)}>
              Callout
            </button>
            <button type="button" className={btnGhost} onClick={() => insert(SNIPPETS.code)}>
              コード
            </button>
            <button type="button" className={btnGhost} onClick={() => insert(SNIPPETS.link)}>
              リンク
            </button>
          </div>
          <label className="sr-only" htmlFor="pe-body">
            本文（Markdown）
          </label>
          <textarea
            id="pe-body"
            ref={bodyRef}
            rows={26}
            className="bg-surface-950 border-brand-700 text-ink-inverse-50 focus:outline-brand-500 w-full resize-y rounded-xl border-[1.5px] px-4 py-3.5 font-mono text-[13px] leading-[1.8] focus:outline-2"
            value={v.bodyMd}
            onChange={(e) => setV((x) => ({ ...x, bodyMd: e.target.value }))}
          />
          <FieldError message={errors.bodyMd} />
          <details className="text-ink-600 text-xs">
            <summary className="cursor-pointer font-bold">画像を挿入する</summary>
            <div className="mt-3">
              <ImageUpload
                label="画像"
                prefix="posts"
                value=""
                onChange={(url) => url && insert(`\n![画像の説明](${url})\n`)}
              />
            </div>
          </details>
        </section>
        <section className={`${cardClass} flex flex-col gap-3 p-6 sm:p-8`} aria-label="プレビュー">
          <span className="text-brand-500 text-xs font-bold tracking-[0.12em] uppercase">
            Preview
          </span>
          <div className="text-ink-950 text-[28px] leading-[1.35] font-black">
            {v.title || '（タイトル）'}
          </div>
          {tags.length ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="bg-brand-100 text-brand-700 rounded-full px-[11px] py-1 text-xs font-bold"
                >
                  #{t}
                </span>
              ))}
            </div>
          ) : null}
          <div className="bg-surface-200 my-2 h-px" />
          <NoteMarkdown markdown={v.bodyMd} />
        </section>
      </div>

      {v.id ? (
        <button
          type="button"
          className="text-danger-600 w-fit text-xs font-bold"
          onClick={() => {
            if (!confirm('この記事を削除しますか？元に戻せません。')) return
            start(async () => {
              const res = await deletePost({ id: v.id! })
              if (res.ok) router.push('/admin/works')
              else setMessage({ tone: 'error', text: res.error })
            })
          }}
        >
          この記事を削除
        </button>
      ) : null}
    </div>
  )
}
