import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import type { Element, ElementContent, Root, Text } from 'hast'

// 管理画面から入力された Markdown を安全な HTML にする（MDX としては評価しない）
// 1. 生の HTML は remark-rehype で捨て、2. rehype-sanitize で許可リスト外の要素・属性・URL を除き、
// 3. サニタイズ後に、こちらで決めた構造（Callout・コードブロックの見出し）だけを足す

const CALLOUT_TYPES = {
  NOTE: { type: 'info', label: 'Info' },
  TIP: { type: 'success', label: 'Tip' },
  WARNING: { type: 'warning', label: 'Warning' },
  CAUTION: { type: 'error', label: 'Error' },
} as const

const schema = {
  ...defaultSchema,
  // GitHub の既定スキーマは id に "user-content-" を付ける。見出しのアンカーは不要なので id を許可しない
  clobber: [],
  attributes: {
    ...defaultSchema.attributes,
    '*': (defaultSchema.attributes?.['*'] ?? []).filter((a) => a !== 'id'),
  },
}

function isElement(node: ElementContent | undefined, tag?: string): node is Element {
  return node?.type === 'element' && (!tag || node.tagName === tag)
}

function text(value: string): Text {
  return { type: 'text', value }
}

function el(tagName: string, className: string[], children: ElementContent[]): Element {
  return { type: 'element', tagName, properties: { className }, children }
}

/** > [!TIP] 形式の引用を Callout に変える */
function toCallout(node: Element): Element | null {
  const firstP = node.children.find((c) => isElement(c, 'p'))
  if (!isElement(firstP)) return null
  const head = firstP.children[0]
  if (head?.type !== 'text') return null
  const m = /^\[!(NOTE|TIP|WARNING|CAUTION)\]\s*\n?/.exec(head.value)
  if (!m) return null

  const { type, label } = CALLOUT_TYPES[m[1] as keyof typeof CALLOUT_TYPES]
  head.value = head.value.slice(m[0].length)
  const body = node.children.filter((c) => !(c.type === 'text' && !c.value.trim()))
  return el(
    'div',
    ['md-callout', `md-callout-${type}`],
    [
      el('span', ['md-callout-icon'], []),
      el('div', ['md-callout-body'], [el('div', ['md-callout-label'], [text(label)]), ...body]),
    ]
  )
}

/** コードブロックに言語名の見出しを付ける */
function toCodeBlock(node: Element): Element {
  const code = node.children.find((c) => isElement(c, 'code'))
  const classes = isElement(code) ? ((code.properties.className as string[] | undefined) ?? []) : []
  const lang = classes.find((c) => c.startsWith('language-'))?.slice('language-'.length)
  return el('div', ['md-code'], [el('div', ['md-code-head'], [text(lang ?? 'code')]), node])
}

function rehypeDecorate() {
  return (tree: Root) => {
    const visit = (parent: Root | Element) => {
      parent.children = parent.children.map((child) => {
        if (child.type !== 'element') return child
        if (child.tagName === 'blockquote') {
          const callout = toCallout(child)
          if (callout) return callout
        }
        if (child.tagName === 'pre') return toCodeBlock(child)
        // リンクは新しいタブで開き、参照元を渡さない
        if (child.tagName === 'a') {
          const href = String(child.properties.href ?? '')
          if (/^https?:\/\//.test(href)) {
            child.properties.target = '_blank'
            child.properties.rel = ['noopener', 'noreferrer', 'nofollow']
          }
        }
        visit(child)
        return child
      }) as typeof parent.children
    }
    visit(tree)
  }
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSanitize, schema)
  .use(rehypeDecorate)
  .use(rehypeStringify)

export function renderMarkdown(markdown: string): string {
  return String(processor.processSync(markdown))
}
