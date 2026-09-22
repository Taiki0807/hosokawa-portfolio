import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// gray-matterはYAMLのdate(クォート無し日付)をDateオブジェクトとして
// 解析するため、文字列に正規化する
function toDateString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0] // "2026-05-20"
  }
  return String(value)
}

// ============================================
// CSS記録 (content/css-notes/*.mdx)
// ============================================

const NOTES_DIR = path.join(process.cwd(), 'content', 'css-notes')

export type NoteFrontmatter = {
  title: string
  category: string
  date: string
  readingTime: number
}

export type NoteMeta = NoteFrontmatter & { slug: string }

export function getAllNotes(): NoteMeta[] {
  return readAllMeta(NOTES_DIR) as NoteMeta[]
}

export function getNoteBySlug(slug: string) {
  return readBySlug(NOTES_DIR, slug) as {
    slug: string
    frontmatter: NoteFrontmatter
    content: string
  }
}

export function getAllNoteSlugs(): string[] {
  return readAllSlugs(NOTES_DIR)
}

export function getNotesByCategory(): Record<string, NoteMeta[]> {
  return groupByCategory(getAllNotes())
}

// ============================================
// ブログ (content/blog/*.mdx)
// ============================================

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export type PostFrontmatter = {
  title: string
  category: string
  date: string
  readingTime: number
  excerpt?: string
  tags?: string[]
}

export type PostMeta = PostFrontmatter & { slug: string }

export function getAllPosts(): PostMeta[] {
  return readAllMeta(BLOG_DIR) as PostMeta[]
}

export function getPostBySlug(slug: string) {
  return readBySlug(BLOG_DIR, slug) as {
    slug: string
    frontmatter: PostFrontmatter
    content: string
  }
}

export function getAllPostSlugs(): string[] {
  return readAllSlugs(BLOG_DIR)
}

export function getPostsByCategory(): Record<string, PostMeta[]> {
  return groupByCategory(getAllPosts())
}

// ============================================
// 制作物（content/projects/*.mdx）
// ============================================

const PROJECTS_DIR = path.join(process.cwd(), 'content', 'projects')

export type ProjectFrontmatter = {
  title: string
  description: string
  date: string
  readingTime: number
  tags: string[]
  link?: { label: string; href: string }
}

export type ProjectMeta = ProjectFrontmatter & { slug: string }

export function getAllProjects(): ProjectMeta[] {
  return readAllMeta(PROJECTS_DIR) as ProjectMeta[]
}

export function getProjectBySlug(slug: string) {
  return readBySlug(PROJECTS_DIR, slug) as {
    slug: string
    frontmatter: ProjectFrontmatter
    content: string
  }
}

export function getAllProjectSlugs(): string[] {
  return readAllSlugs(PROJECTS_DIR)
}

// ============================================
// 共通ヘルパー
// ============================================

function readAllMeta(dir: string) {
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))

  const items = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, '')
    const fullPath = path.join(dir, filename)
    const fileContent = fs.readFileSync(fullPath, 'utf-8')
    const { data } = matter(fileContent)

    return {
      slug,
      ...data,
      date: toDateString(data.date),
    }
  })

  return items.sort((a, b) => (a.date > b.date ? -1 : 1))
}

function readBySlug(dir: string, slug: string) {
  const fullPath = path.join(dir, `${slug}.mdx`)
  const fileContent = fs.readFileSync(fullPath, 'utf-8')
  const { data, content } = matter(fileContent)

  return {
    slug,
    frontmatter: {
      ...data,
      date: toDateString(data.date),
    },
    content,
  }
}

function readAllSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

function groupByCategory<T extends { category: string }>(items: T[]): Record<string, T[]> {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, T[]>
  )
}
