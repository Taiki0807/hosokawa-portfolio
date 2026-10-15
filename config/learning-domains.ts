// 「技術の目線」に出す、学習時間から見た技術領域の内訳
// タグと領域の対応はここで管理する。どの領域にも入らないタグは「その他」になる

export type LearningDomain = {
  id: string
  label: string
  color: string
  tags: string[]
}

export const LEARNING_DOMAINS: LearningDomain[] = [
  {
    id: 'cloud',
    label: 'クラウド・インフラ',
    color: '#5b4fe0',
    tags: ['AWS', 'GCP', 'Terraform', 'Docker', 'Kubernetes', 'ネットワーク', 'Linux'],
  },
  {
    id: 'frontend',
    label: 'フロントエンド',
    color: '#7a6fe0',
    tags: ['Next.js', 'React', 'TypeScript', 'CSS', 'JavaScript'],
  },
  {
    id: 'fundamentals',
    label: '基礎・言語',
    color: '#cbeb4d',
    tags: ['アルゴリズム', 'Python', 'C++', 'C#', 'SQL', 'Oracle'],
  },
  {
    id: 'cert',
    label: '資格対策',
    color: '#342c7a',
    tags: ['資格対策'],
  },
]

export const OTHER_DOMAIN: LearningDomain = {
  id: 'other',
  label: 'その他',
  color: '#a6a2c4',
  tags: [],
}

// 記録フォームのタグ候補（自由入力も可）
export const SUGGESTED_TAGS = [...new Set(LEARNING_DOMAINS.flatMap((d) => d.tags))]
