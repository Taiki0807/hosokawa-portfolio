import { proseClassName } from '@/components/ui/prose'
import { renderMarkdown } from '@/lib/markdown/render'

// renderMarkdown はサニタイズ済みの HTML を返す（生の HTML・スクリプト・危険な URL は除去済み）
export default function NoteMarkdown({
  markdown,
  className = '',
}: {
  markdown: string
  className?: string
}) {
  return (
    <div
      className={`${proseClassName} md-note ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  )
}
