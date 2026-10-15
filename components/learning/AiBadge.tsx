import { SparkleIcon } from '@/components/ui/icons'

/** AI が整えた・作成した文章に必ず付ける表示（設定で消せない） */
export default function AiBadge({ label = 'AI整形' }: { label?: string }) {
  return (
    <span className="bg-surface-950 inline-flex flex-none items-center gap-[5px] rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-lime-500">
      <SparkleIcon />
      {label}
    </span>
  )
}
