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

export const skills: Skill[] = [
  {
    name: 'Next.js',
    description: 'ルーティング、レイアウト、APIルートを使ったモダンなアプリ開発。趣味で利用。',
    hasExperience: false,
  },
  {
    name: 'React',
    description: 'コンポーネント・状態管理・propsを使ったUI構築。趣味で利用。',
    hasExperience: false,
  },
  {
    name: 'TypeScript',
    description: '型安全なコードでバグを未然に防ぐ開発スタイル。趣味で利用。',
    hasExperience: false,
  },
  {
    name: 'C#',
    description: '業務システム開発',
    hasExperience: true,
  },
  {
    name: 'Oracle',
    description: 'SQLによるデータ操作・業務データベースの運用。',
    hasExperience: true,
  },
  {
    name: 'Python',
    description: '業務システム開発、競技プラミングで使用',
    hasExperience: true,
  },
  {
    name: 'C++',
    description: '競技プログラミング(AtCoder等)で使用。アルゴリズム・データ構造の学習。',
    hasExperience: false,
  },
  {
    name: 'AWS',
    description: 'EC2・S3・Lambdaなどを使ったクラウド構成。趣味で利用。',
    hasExperience: true,
  },
  {
    name: 'GCP',
    description: 'Cloud Run・FireStorageなどを使ったクラウド構成。趣味で利用。',
    hasExperience: false,
  },
]

// ============================================
// 資格・バッジ
// ============================================
export type Certification = {
  name: string
  date: string
  badgeUrl?: string
  credentialUrl?: string
}

export const certifications: Certification[] = [
  {
    name: 'AWS Certified Developer – Associate',
    date: '2026-03',
    badgeUrl: '/badges/aws-certified-developer-associate.png',
    credentialUrl: 'https://www.credly.com/badges/89f89d7b-4e76-407a-ba0e-ec32cc01686d/public_url',
  },
  {
    name: 'Associate Cloud Engineer',
    date: '2026-03',
    badgeUrl: '/badges/associate-cloud-engineer-certification.png',
    credentialUrl: 'https://www.credly.com/badges/dff52c35-ee88-441a-ac59-b193c045ffe7/public_url',
  },
  {
    name: 'Professional Cloud Architect',
    date: '2026-04',
    badgeUrl: '/badges/professional-cloud-architect-certification.png',
    credentialUrl: 'https://www.credly.com/badges/db413ed1-e982-49f4-82b9-0c40c051d43b/public_url',
  },
]
