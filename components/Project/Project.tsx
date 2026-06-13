import Link from 'next/link'
import SectionHeading from '../Helper/SectionHeading'
import { projects } from '@/data'

const Project = () => {
  return (
    <div className="bg-gray-100 py-16" id="projects">
      <div className="mx-auto flex max-w-5xl flex-col items-start px-6">
        <SectionHeading
          tag="// 制作物"
          title="作ったもの"
          description="学習中に制作したプロジェクトや個人開発の成果物です。"
        />

        <div className="flex w-full justify-center">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.title}
                className="flex w-full max-w-sm flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 text-3xl">{project.emoji}</div>

                <h3 className="mb-2 text-lg font-bold text-gray-900">{project.title}</h3>

                <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-500">
                  {project.description}
                </p>

                <div className="mb-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 font-mono text-xs font-semibold text-purple-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {project.internal ? (
                  <Link
                    href={project.link.href}
                    className="inline-flex w-fit items-center gap-1 rounded-lg border border-purple-200 px-4 py-2 text-sm font-bold text-purple-600 transition hover:bg-purple-50"
                  >
                    → {project.link.label}
                  </Link>
                ) : (
                  <a
                    href={project.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-1 rounded-lg border border-purple-200 px-4 py-2 text-sm font-bold text-purple-600 transition hover:bg-purple-50"
                  >
                    → {project.link.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Project
