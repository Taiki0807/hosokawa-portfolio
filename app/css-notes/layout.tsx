import Link from 'next/link'
import { getNotesByCategory } from '@/lib/content'

export default function CssNotesLayout({ children }: { children: React.ReactNode }) {
  const grouped = getNotesByCategory()

  return (
    <div className="flex min-h-screen pt-24">
      {/* サイドバー */}
      <aside className="sticky top-24 hidden h-[calc(100vh-6rem)] w-64 shrink-0 overflow-y-auto border-r border-purple-100 bg-white/60 px-4 py-8 backdrop-blur md:block">
        {Object.entries(grouped).map(([category, notes]) => (
          <div key={category} className="mb-6">
            <div className="mb-1.5 px-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
              {category}
            </div>
            <div>
              {notes.map((note) => (
                <Link
                  key={note.slug}
                  href={`/css-notes/${note.slug}`}
                  className="block rounded-md px-2.5 py-1.5 text-sm text-gray-500 transition hover:bg-purple-50 hover:text-purple-600"
                >
                  {note.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </aside>

      {/* メインコンテンツ */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:px-12">{children}</main>
    </div>
  )
}
