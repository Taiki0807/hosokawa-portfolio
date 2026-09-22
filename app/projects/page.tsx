import Link from 'next/link'
import { getAllProjects } from '@/lib/content'

export default function ProjectsPage() {
  const projects = getAllProjects()

  return (
    <div>
      <div className="mb-9">
        <h1 className="text-ink-950 mb-1.5 text-2xl font-black tracking-tight sm:text-3xl">
          Projects
        </h1>
        <p className="text-ink-600 text-sm">学習中に制作したプロジェクトや個人開発の成果物です。</p>
      </div>

      <div className="flex flex-col gap-4">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="border-surface-200 bg-surface-0 block rounded-2xl border p-5 shadow-[0_20px_40px_-16px_rgba(16,14,24,0.1)] transition hover:-translate-y-0.5"
          >
            <h2 className="text-ink-950 mb-1.5 text-base font-bold">{project.title}</h2>
            <p className="text-ink-600 mb-3 text-sm leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-surface-50 text-ink-600 rounded-full px-2.5 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
