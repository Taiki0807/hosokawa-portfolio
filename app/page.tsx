import Home from '@/components/Home/Home'

// 学習ログは「今日（JST）」を基準に描くため、記録の更新がなくても 1 時間ごとに作り直す
export const revalidate = 3600

export default function HomePage() {
  return <Home />
}
