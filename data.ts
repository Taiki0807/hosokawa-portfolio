// ============================================
// プロフィール情報
// ============================================
export const profile = {
  name: 'Hosokawa',
  role: 'フルスタックエンジニア',
  bio: '日々新しい技術を追いかけながら学び続けるエンジニアです。Next.js・クラウド・競技プログラミングなど幅広く学習中。学んだことはこのサイトで記録・発信しています。',
  status: '新しい機会を探しています',
  location: '東京都',
} as const

// ============================================
// 連絡先・SNS
// ============================================
export const contact = {
  email: 'hosokawa.dev@gmail.com',
  github: 'https://github.com/Taiki0807',
  twitter: 'https://twitter.com/M4Cx4',
  linkedin: 'https://linkedin.com/in/hosokawa',
} as const

// ============================================
// About セクション
// ============================================
export const about = {
  heading: 'A passionate developer who loves to create',
  paragraphs: [
    'Webサイトの仕組みに興味を持ったことがきっかけで、フルスタック開発を学んでいます。',
    'コードを書くだけでなく、学んだことを記録・発信することにも力を入れています。',
  ],
  highlights: [
    { label: '東京在住', icon: '📍' },
    { label: '競技プログラミング(C++)・Kaggle学習中', icon: '🧮' },
    { label: '趣味は釣りとダーツ', icon: '🎯' },
  ],
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
export type SkillLevel = '上級' | '中級' | '初級'

export type Skill = {
  icon: string
  name: string
  description: string
  level: SkillLevel
  hasExperience: boolean
  rating: number // 1〜5
}

export const skills: Skill[] = [
  {
    icon: '▲',
    name: 'Next.js',
    description: 'ルーティング、レイアウト、APIルートを使ったモダンなアプリ開発。趣味で利用。',
    level: '中級',
    hasExperience: false,
    rating: 2,
  },
  {
    icon: '⚛',
    name: 'React',
    description: 'コンポーネント・状態管理・propsを使ったUI構築。趣味で利用。',
    level: '中級',
    hasExperience: false,
    rating: 2,
  },
  {
    icon: 'TS',
    name: 'TypeScript',
    description: '型安全なコードでバグを未然に防ぐ開発スタイル。趣味で利用。',
    level: '中級',
    hasExperience: false,
    rating: 2,
  },
  {
    icon: 'C#',
    name: 'C#',
    description: '業務システム開発',
    level: '中級',
    hasExperience: true,
    rating: 3,
  },
  {
    icon: '🗄️',
    name: 'Oracle',
    description: 'SQLによるデータ操作・業務データベースの運用。',
    level: '初級',
    hasExperience: true,
    rating: 2,
  },
  {
    icon: '🐍',
    name: 'Python',
    description: '業務システム開発、競技プラミングで使用',
    level: '中級',
    hasExperience: true,
    rating: 3,
  },
  {
    icon: '🧩',
    name: 'C++',
    description: '競技プログラミング(AtCoder等)で使用。アルゴリズム・データ構造の学習。',
    level: '中級',
    hasExperience: false,
    rating: 3,
  },
  {
    icon: '☁️',
    name: 'AWS',
    description: 'EC2・S3・Lambdaなどを使ったクラウド構成。趣味で利用。',
    level: '中級',
    hasExperience: true,
    rating: 3,
  },
  {
    icon: '🌐',
    name: 'GCP',
    description: 'Cloud Run・FireStorageなどを使ったクラウド構成。趣味で利用。',
    level: '初級',
    hasExperience: false,
    rating: 2,
  },
]

// ============================================
// 資格・バッジ
// ============================================
export type Certification = {
  name: string
  issuer: string
  date: string
  badgeUrl?: string
  credentialUrl?: string
}

export const certifications: Certification[] = [
  {
    name: 'AWS Certified CloudOps Engineer – Associate',
    issuer: 'Amazon Web Services',
    date: '2026-03',
    badgeUrl: '/badges/aws-certified-developer-associate.png',
    credentialUrl: 'https://www.credly.com/badges/89f89d7b-4e76-407a-ba0e-ec32cc01686d/public_url',
  },
  {
    name: 'Associate Cloud Engineer',
    issuer: 'Google Cloud',
    date: '2026-03',
    badgeUrl: '/badges/associate-cloud-engineer-certification.png',
    credentialUrl: 'https://www.credly.com/badges/dff52c35-ee88-441a-ac59-b193c045ffe7/public_url',
  },
  {
    name: 'Professional Cloud Architect',
    issuer: 'Google Cloud',
    date: '2026-04',
    badgeUrl: '/badges/professional-cloud-architect-certification.png',
    credentialUrl: 'https://www.credly.com/badges/db413ed1-e982-49f4-82b9-0c40c051d43b/public_url',
  },
]

// ============================================
// 制作物（プロジェクト）
// ============================================
export type Project = {
  emoji: string
  title: string
  description: string
  tags: string[]
  link: { label: string; href: string }
  internal?: boolean // CSS記録ページなど内部リンクの場合 true
}

export const projects: Project[] = [
  {
    emoji: '📝',
    title: 'CSS学習記録サイト',
    description:
      'Next.js + MDXで構築した自分のCSS学習ノート。コンポーネントのプレビュー機能付きで、学んだことをそのまま記録・公開しています。',
    tags: ['Next.js', 'MDX', 'Tailwind', 'TypeScript'],
    link: { label: 'サイトを見る', href: '/css-notes' },
    internal: true,
  },
]
