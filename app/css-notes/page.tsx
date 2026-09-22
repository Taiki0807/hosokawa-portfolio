import Link from 'next/link'
import { getAllNotes } from '@/lib/content'

export default function CssNotesPage() {
  const notes = getAllNotes()

  return (
    <div>
      <div className="mb-9">
        <h1 className="text-ink-950 mb-1.5 text-2xl font-black tracking-tight sm:text-3xl">
          CSS 学習記録
        </h1>
        <p className="text-ink-600 text-sm">
          CSSを学びながら書いたノート。プレビュー付きのサンプルコードと解説。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {notes.map((note) => (
          <Link
            key={note.slug}
            href={`/css-notes/${note.slug}`}
            className="border-surface-200 bg-surface-0 rounded-2xl border p-5 shadow-[0_20px_40px_-16px_rgba(16,14,24,0.1)] transition hover:-translate-y-0.5"
          >
            <span className="border-surface-200 bg-surface-0 text-ink-950 mb-3 inline-block rounded-full border px-3 py-0.5 text-xs font-bold">
              {note.category}
            </span>
            <h2 className="text-ink-950 mb-1.5 text-base font-bold">{note.title}</h2>
            <div className="text-ink-600 flex items-center gap-2 text-xs">
              <span>{note.date}</span>
              <span>·</span>
              <span>{note.readingTime} min</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
