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

export function CodePreview({ children, code, language = 'tsx' }: CodePreviewProps) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview')

  // code が指定されていなければ children から自動生成
  const displayCode = code ?? elementToString(children)

  return (
    <div className="not-prose my-5 overflow-hidden rounded-xl border border-purple-100">
      {/* タブバー */}
      <div className="flex items-center gap-1 border-b border-purple-100 bg-purple-50/60 px-3 py-2">
        <button
          onClick={() => setTab('preview')}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
            tab === 'preview'
              ? 'bg-white font-bold text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-purple-600'
          }`}
        >
          プレビュー
        </button>
        <button
          onClick={() => setTab('code')}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
            tab === 'code'
              ? 'bg-white font-bold text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-purple-600'
          }`}
        >
          コード
        </button>
      </div>

      {/* コンテンツ */}
      {tab === 'preview' ? (
        <div className="not-prose bg-white p-5">{children}</div>
      ) : (
        <pre className="not-prose m-0 overflow-x-auto bg-[#16162a] p-5 text-sm">
          <code className={`language-${language} !bg-transparent whitespace-pre !text-[#c8c8f0]`}>
            {displayCode}
          </code>
        </pre>
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
