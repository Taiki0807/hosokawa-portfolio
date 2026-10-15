// ============================================
// プロフィール情報
// ============================================
export const profile = {
  name: 'Hosokawa',
  bio: '日々新しい技術を追いかけながら学び続けるエンジニアです。Next.js・クラウド・競技プログラミングなど幅広く学習中。学んだことはこのサイトで記録・発信しています。',
} as const

// ============================================
// 連絡先・SNS
// ============================================
export const contact = {
  email: 'hosokawa.dev@gmail.com',
  github: 'https://github.com/Taiki0807',
} as const

// ============================================
// About セクション
// ============================================
export const about = {
  stats: [
    { number: '3+', label: '年の業務経験' },
    { number: '9+', label: '使用技術' },
    { number: '3', label: '取得資格' },
    { number: '∞', label: '学習意欲' },
  ],
} as const

// ============================================
// スキル
// ============================================
export type Skill = {
  name: string
  description: string
  hasExperience: boolean
}

// スキルは D1（skill テーブル）で管理し、/admin/skills から編集する

// ============================================
// 資格・バッジ
// ============================================
export type Certification = {
  name: string
  date: string
  badgeUrl?: string
  credentialUrl?: string
}

// 取得済み資格は D1（certification テーブル）で管理し、/admin/skills から編集する
