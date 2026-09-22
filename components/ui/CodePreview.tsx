'use client'

import React, { useState } from 'react'

type CodePreviewProps = {
  /** 表示するJSX（プレビューにも、コードタブの元データにも使われる） */
  children: React.ReactNode
  /**
   * 表示用のソースコード文字列。
   * 省略時は children を簡易的にJSX文字列化して表示する。
   */
  code?: string
  language?: string
}

/**
 * React要素を簡易的にJSX文字列に変換する
 * （あくまで表示用の近似。完全なフォーマットは保証しない）
 */
function elementToString(node: React.ReactNode, indent = 0): string {
  const pad = '  '.repeat(indent)

  if (typeof node === 'string' || typeof node === 'number') {
    return `${pad}${node}`
  }

  if (!React.isValidElement(node)) return ''

  const { type, props } = node
  const tag = typeof type === 'string' ? type : 'Component'

  // props を className="..." の形式に整形
  const attrs = Object.entries(props as Record<string, unknown>)
    .filter(([key]) => key !== 'children')
    .map(([key, value]) => {
      if (key === 'className') return `className="${value}"`
      if (typeof value === 'string') return `${key}="${value}"`
      return `${key}={${JSON.stringify(value)}}`
    })
    .join(' ')

  const children = (props as { children?: React.ReactNode }).children

  // children がない場合は自己終了タグ
  if (children === undefined) {
    return `${pad}<${tag}${attrs ? ' ' + attrs : ''} />`
  }

  const childrenArray = React.Children.toArray(children)
  const childrenStr = childrenArray.map((child) => elementToString(child, indent + 1)).join('\n')

  return `${pad}<${tag}${attrs ? ' ' + attrs : ''}>\n${childrenStr}\n${pad}</${tag}>`
}

/** JSXっぽい文字列を「タグ記号 / 属性値の文字列 / タグ内テキスト」の3トーンで色分けする */
function highlightJsx(code: string) {
  const nodes: React.ReactNode[] = []
  let key = 0
  let buf = ''
  let inTag = false

  const flush = (color: string) => {
    if (!buf) return
    nodes.push(
      <span key={key++} style={{ color }}>
        {buf}
      </span>
    )
    buf = ''
  }

  let i = 0
  while (i < code.length) {
    const ch = code[i]

    if (ch === '<') {
      flush(inTag ? '#a6a2c4' : '#cbeb4d')
      inTag = true
      buf = ch
      i++
      continue
    }

    if (ch === '>') {
      buf += ch
      flush('#a6a2c4')
      inTag = false
      i++
      continue
    }

    if (inTag && (ch === '"' || ch === "'")) {
      flush('#a6a2c4')
      const quote = ch
      let str = ch
      i++
      while (i < code.length && code[i] !== quote) {
        str += code[i]
        i++
      }
      str += code[i] ?? ''
      i++
      nodes.push(
        <span key={key++} style={{ color: '#f5f4fb' }}>
          {str}
        </span>
      )
      continue
    }

    buf += ch
    i++
  }
  flush(inTag ? '#a6a2c4' : '#cbeb4d')

  return nodes
}

export function CodePreview({ children, code }: CodePreviewProps) {
  const [tab, setTab] = useState<'code' | 'preview'>('code')

  // code が指定されていなければ children から自動生成
  const displayCode = code ?? elementToString(children)

  const tabButton = (target: 'code' | 'preview', label: string) => (
    <button
      onClick={() => setTab(target)}
      className={`rounded-t-[8px] px-4 py-2 font-mono text-xs font-bold ${
        tab === target ? 'bg-surface-900 text-ink-inverse-50' : 'text-[#6b6884]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="not-prose bg-surface-950 my-5 overflow-hidden rounded-2xl">
      <div className="flex gap-1 px-3 pt-2.5">
        {tabButton('code', 'Code')}
        {tabButton('preview', 'Preview')}
      </div>
      <div className="bg-surface-900 h-px" />

      {tab === 'code' ? (
        <pre className="m-0 overflow-x-auto px-5 py-[22px] font-mono text-[13px] leading-[1.9]">
          <code className="whitespace-pre">{highlightJsx(displayCode)}</code>
        </pre>
      ) : (
        <div className="bg-surface-900 flex items-center justify-center px-5 py-10">{children}</div>
      )}
    </div>
  )
}

// ---- 使用例（MDX内） ----
// code prop は不要。children に書いたJSXがそのままコードタブにも表示される
//
// <CodePreview>
//   <div className="flex gap-2.5">
//     <div className="px-6 py-4 bg-purple-600 text-white rounded-lg font-bold">Box 1</div>
//     <div className="px-6 py-4 bg-purple-400 text-white rounded-lg font-bold">Box 2</div>
//   </div>
// </CodePreview>
