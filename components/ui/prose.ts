export const proseClassName =
  'prose max-w-none ' +
  'prose-headings:text-ink-950 prose-headings:font-black ' +
  'prose-h2:text-[20px] prose-h3:font-mono prose-h3:text-base ' +
  'prose-p:text-ink-600 prose-p:leading-[1.95] ' +
  'prose-strong:text-ink-950 ' +
  'prose-a:text-brand-500 ' +
  'prose-li:text-ink-600 prose-li:marker:text-brand-400 ' +
  'prose-code:rounded-md prose-code:bg-surface-0 prose-code:border prose-code:border-surface-200 ' +
  'prose-code:text-brand-700 prose-code:font-bold prose-code:px-2 prose-code:py-0.5 ' +
  'prose-code:before:content-none prose-code:after:content-none ' +
  // 直前のprose-code(インラインコードの"チップ"風スタイル)は
  // pre内のcodeにも当たってしまうため、コードブロックの見た目は個別にリセットして
  // ライトなカード風に統一する(デフォルトのTailwind Typographyの黒背景を避ける)。
  'prose-pre:bg-surface-0 prose-pre:border prose-pre:border-surface-200 prose-pre:text-ink-950 ' +
  'prose-pre:rounded-xl prose-pre:shadow-none ' +
  '[&_pre_code]:bg-transparent [&_pre_code]:border-none [&_pre_code]:p-0 [&_pre_code]:rounded-none ' +
  '[&_pre_code]:font-normal [&_pre_code]:text-inherit'
