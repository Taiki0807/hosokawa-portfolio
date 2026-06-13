import Link from 'next/link'
import { getAllNotes } from '@/lib/content'

export default function CssNotesPage() {
  const notes = getAllNotes()

  return (
    <div>
      <div className="mb-9">
        <h1 className="mb-1.5 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
          CSS 学習記録
        </h1>
        <p className="text-sm text-gray-500">
          CSSを学びながら書いたノート。プレビュー付きのサンプルコードと解説。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {notes.map((note) => (
          <Link
            key={note.slug}
            href={`/css-notes/${note.slug}`}
            className="rounded-2xl border border-purple-100 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="mb-3 inline-block rounded-full border border-purple-200 bg-purple-50 px-3 py-0.5 font-mono text-xs font-bold text-purple-600">
              {note.category}
            </span>
            <h2 className="mb-1.5 text-base font-bold text-gray-900">{note.title}</h2>
            <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
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
