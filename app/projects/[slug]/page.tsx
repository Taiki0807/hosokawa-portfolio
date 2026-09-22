import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/content'
import { Callout } from '@/components/ui/Callout'
import { CodePreview } from '@/components/ui/CodePreview'
import { proseClassName } from '@/components/ui/prose'

const mdxComponents = {
  Callout,
  CodePreview,
}

export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }))
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params

  let project
  try {
    project = getProjectBySlug(slug)
  } catch {
    notFound()
  }

  const { frontmatter, content } = project

  return (
    <article>
      <Link
        href="/projects"
        className="text-brand-500 mb-5 inline-flex items-center gap-1.5 text-[13px] font-bold"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Projects
      </Link>

      <div className="mb-4 flex items-center gap-2">
        <span className="text-brand-500 text-xs font-bold tracking-[0.12em] uppercase">
          Project
        </span>
      </div>

      <h1 className="text-ink-950 mb-2 text-3xl font-black tracking-tight sm:text-4xl">
        {frontmatter.title}
      </h1>

      <div className="border-surface-200 text-ink-600 mb-6 flex items-center gap-2.5 border-b pb-6 text-sm">
        <span>{frontmatter.date}</span>
        <span className="bg-ink-600/40 h-[3px] w-[3px] rounded-full" />
        <span>{frontmatter.readingTime} min read</span>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {frontmatter.tags.map((tag) => (
            <span
              key={tag}
              className="border-surface-200 bg-surface-0 text-ink-950 rounded-full border px-3 py-0.5 text-xs font-bold"
            >
              {tag}
            </span>
          ))}
        </div>
        {frontmatter.link && (
          <a
            href={frontmatter.link.href}
            className="text-ink-950 ml-auto inline-flex items-center gap-1.5 rounded-full bg-lime-500 px-5 py-2 text-[13px] font-bold tracking-[0.06em] uppercase"
          >
            {frontmatter.link.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <div className={proseClassName}>
        <MDXRemote source={content} components={mdxComponents} />
      </div>
    </article>
  )
}
