'use client'

import { useState, useTransition } from 'react'
import { savePublishAndAi } from '@/app/admin/settings/actions'
import Segmented from '@/components/ui/Segmented'
import Toggle from '@/components/ui/Toggle'
import type { SiteSettings } from '@/lib/settings'
import { Notice, btnPrimary, cardClass } from './ui'

function Row({
  label,
  desc,
  children,
}: {
  label: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <div className="border-surface-200 flex items-center justify-between gap-6 border-t py-4 first-of-type:border-t-0">
      <div className="flex flex-col gap-1">
        <span className="text-ink-950 text-sm font-bold">{label}</span>
        <span className="text-ink-600 text-xs leading-[1.7]">{desc}</span>
      </div>
      {children}
    </div>
  )
}

export default function PublishSettingsForm({ initial }: { initial: SiteSettings }) {
  const [s, setS] = useState(initial)
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const pub = (key: keyof SiteSettings['publish']) => (v: boolean) =>
    setS((x) => ({ ...x, publish: { ...x.publish, [key]: v } }))

  return (
    <div className="flex flex-col gap-6">
      <section className={`${cardClass} p-6 sm:p-8`}>
        <h2 className="text-ink-950 mb-2 text-lg font-black">公開設定</h2>
        <Row
          label="学習・開発ログを公開する"
          desc="ホームの最近の記録・Day detail・詳細ページを公開します。"
        >
          <Toggle
            label="学習・開発ログを公開する"
            checked={s.publish.showLog}
            onChange={pub('showLog')}
          />
        </Row>
        <Row label="草（ヒートマップ）を公開する" desc="日ごとの時間の色分けと統計を表示します。">
          <Toggle
            label="草を公開する"
            checked={s.publish.showHeatmap}
            onChange={pub('showHeatmap')}
          />
        </Row>
        <Row label="詳細ノートを公開する" desc="オフにすると、一覧と草だけが表示されます。">
          <Toggle
            label="詳細ノートを公開する"
            checked={s.publish.showNotes}
            onChange={pub('showNotes')}
          />
        </Row>
        <Row
          label="保存と同時に公開する"
          desc="オフのときは下書き保存になり、確認してから公開します。AIが整えた文章は、オンでも確認するまで公開されません。"
        >
          <Toggle
            label="保存と同時に公開する"
            checked={s.publish.publishOnSave}
            onChange={pub('publishOnSave')}
          />
        </Row>
      </section>

      <section className={`${cardClass} p-6 sm:p-8`}>
        <h2 className="text-ink-950 mb-2 text-lg font-black">AI整形</h2>
        <Row
          label="AIで文章を整える"
          desc="フォームの「AIで整える」ボタンと、AIレビューの生成を使えるようにします。"
        >
          <Toggle
            label="AIで文章を整える"
            checked={s.ai.enabled}
            onChange={(v) => setS((x) => ({ ...x, ai: { ...x.ai, enabled: v } }))}
          />
        </Row>
        <Row
          label="「AI整形」バッジを表示する"
          desc="AIが文章を整えた記録には必ずバッジを付けます（変更できません）。"
        >
          <Toggle label="「AI整形」バッジを表示する（固定）" checked disabled onChange={() => {}} />
        </Row>
        <Row
          label="公開前の確認を必須にする"
          desc="自分で読んで確認するまで公開できないようにします（変更できません）。"
        >
          <Toggle label="公開前の確認を必須にする（固定）" checked disabled onChange={() => {}} />
        </Row>
        <div className="border-surface-200 mt-2 flex flex-wrap gap-8 border-t pt-5">
          <div className="flex flex-col gap-2">
            <span className="text-ink-700 text-xs font-bold">文体</span>
            <Segmented
              label="文体"
              value={s.ai.tone}
              onChange={(v) => setS((x) => ({ ...x, ai: { ...x.ai, tone: v } }))}
              options={[
                { value: 'desu', label: 'です・ます' },
                { value: 'da', label: 'だ・である' },
              ]}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-ink-700 text-xs font-bold">長さ</span>
            <Segmented
              label="長さ"
              value={s.ai.length}
              onChange={(v) => setS((x) => ({ ...x, ai: { ...x.ai, length: v } }))}
              options={[
                { value: 'short', label: '短め' },
                { value: 'mid', label: '標準' },
                { value: 'long', label: '詳しめ' },
              ]}
            />
          </div>
        </div>
        <p className="bg-brand-100 text-brand-700 mt-5 rounded-[14px] px-4 py-3 text-xs leading-[1.8]">
          <strong>AIに渡す情報：</strong>
          日付・時間・タグ・メモ・詳細ノートと、レビュー生成時の集計・成果物の説明文のみ。メールアドレスやお問い合わせ、アクセス情報は渡しません。
        </p>
      </section>

      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
      <div>
        <button
          type="button"
          className={btnPrimary}
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await savePublishAndAi(s)
              setMessage(
                res.ok
                  ? { tone: 'success', text: '保存しました。' }
                  : { tone: 'error', text: res.error }
              )
            })
          }
        >
          {pending ? '保存しています…' : '変更を保存'}
        </button>
      </div>
    </div>
  )
}
