import Link from 'next/link'

export default function NotFound() {
  const secondary =
    'border-ink-600 text-ink-950 hover:border-brand-500 hover:text-brand-500 inline-flex items-center rounded-2xl border-[1.5px] px-[27px] py-[13px] text-[13px] font-bold tracking-[0.06em] transition-colors'
  return (
    <main className="flex flex-col items-center gap-6 px-6 pt-24 pb-32 text-center sm:px-20 sm:pt-[120px] sm:pb-40">
      <div className="from-brand-400 via-brand-500 to-brand-700 bg-linear-120 bg-clip-text text-[120px] leading-none font-black text-transparent sm:text-[200px]">
        404
      </div>
      <h1 className="text-ink-950 text-2xl font-black sm:text-[32px]">
        ページが見つかりませんでした
      </h1>
      <p className="text-ink-600 max-w-[440px] text-[15px] leading-[1.9]">
        URLが変わったか、まだ公開していないページかもしれません。下のリンクから探してみてください。
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="text-ink-950 inline-flex items-center rounded-full bg-lime-500 px-7 py-[14px] text-[13px] font-bold tracking-[0.06em] hover:shadow-[0_12px_24px_-8px_rgba(91,79,224,0.28)]"
        >
          ホームへ戻る
        </Link>
        <Link href="/#learning" className={secondary}>
          学習ログを見る
        </Link>
        <Link href="/blog" className={secondary}>
          ブログを読む
        </Link>
      </div>
    </main>
  )
}
