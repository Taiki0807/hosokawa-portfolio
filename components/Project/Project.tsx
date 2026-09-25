import Link from 'next/link'
import Image from 'next/image'
import { Zap, FolderKanban, Box } from 'lucide-react'
import { getAllProjects } from '@/lib/content'

// icon frontmatterで "lucide:<name>" と書いた場合に使うアイコン一覧。
// 各プロジェクト自身のロゴで使われているlucideアイコンをそのまま再現する用途。
const lucideIcons: Record<string, typeof Box> = {
  box: Box,
}

const Project = () => {
  const projects = getAllProjects()

  if (projects.length === 0) return null

  return (
    <div id="projects" className="flex flex-col gap-8 px-6 pb-16 sm:px-10 lg:px-20">
      <div className="flex items-center gap-2">
        <Zap className="fill-brand-500 text-brand-500 h-3.5 w-3.5" />
        <span className="text-brand-500 text-xs font-bold tracking-[0.12em] uppercase">
          Featured project
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {projects.map((project) => {
          const lucideName = project.icon?.startsWith('lucide:')
            ? project.icon.slice('lucide:'.length)
            : null
          const LucideIcon = lucideName ? lucideIcons[lucideName] : null

          return (
            <Link key={project.slug} href={`/projects/${project.slug}`} className="block">
              <div className="bg-surface-0 flex w-full flex-col items-center gap-8 rounded-[28px] p-8 shadow-[0_20px_40px_-16px_rgba(16,14,24,0.16)] transition-transform hover:-translate-y-0.5 sm:flex-row sm:p-12">
                <div className="bg-brand-200 flex h-40 w-full flex-none items-center justify-center rounded-[20px] sm:w-[220px]">
                  {LucideIcon ? (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 shadow-[0_12px_24px_-12px_rgba(16,14,24,0.25)]">
                      <LucideIcon className="h-8 w-8 text-white" strokeWidth={1.6} />
                    </div>
                  ) : project.icon ? (
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-[0_12px_24px_-12px_rgba(16,14,24,0.25)]">
                      {project.icon.startsWith('/') ? (
                        <Image
                          src={project.icon}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-contain p-3"
                        />
                      ) : (
                        <span className="text-4xl">{project.icon}</span>
                      )}
                    </div>
                  ) : (
                    <FolderKanban className="text-brand-700 h-16 w-16" strokeWidth={1.3} />
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <div className="text-ink-950 text-2xl font-black">{project.title}</div>
                  <p className="text-ink-600 max-w-xl text-[15px] leading-[1.7]">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-surface-50 text-ink-950 inline-flex items-center rounded-full px-4 py-2 text-[13px] font-bold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default Project
