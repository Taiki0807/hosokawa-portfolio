import React from 'react'

type SkillCardProps = {
  icon: React.ReactNode
  name: string
  description: string
  level: '上級' | '中級' | '初級'
  hasExperience: boolean
  rating: number // 1〜5
}

const levelColors: Record<string, string> = {
  上級: 'bg-purple-100 text-purple-700',
  中級: 'bg-blue-100 text-blue-700',
  初級: 'bg-gray-100 text-gray-600',
}

export const SkillCard = ({
  icon,
  name,
  description,
  level,
  hasExperience,
  rating,
}: SkillCardProps) => {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* アイコン */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 text-2xl font-bold text-white">
        {icon}
      </div>

      {/* 名前 + 経験バッジ */}
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>

        {hasExperience ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            ● 業務経験あり
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
            学習中
          </span>
        )}
      </div>

      {/* 説明 */}
      <p className="mb-4 text-sm leading-relaxed text-gray-500">{description}</p>

      {/* レベルバッジ + 星評価 */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${levelColors[level]}`}
        >
          {level}
        </span>

        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-200'}>
              ★
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
