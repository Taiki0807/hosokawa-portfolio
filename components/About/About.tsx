import { Zap } from 'lucide-react'
import { about } from '@/data'

const About = () => {
  const [years, techs, certs] = about.stats

  return (
    <div id="about" className="px-6 py-16 sm:px-10 lg:px-20">
      <div className="from-brand-400 via-brand-500 to-brand-700 relative overflow-hidden rounded-[20px] bg-linear-[115deg] p-10 sm:p-16">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 1280 220"
          aria-hidden="true"
        >
          <g stroke="#ffffff" strokeOpacity="0.08" strokeWidth="30" strokeLinecap="round">
            <line x1="1000" y1="280" x2="1160" y2="-60" />
            <line x1="1090" y1="280" x2="1250" y2="-60" />
            <line x1="1180" y1="280" x2="1340" y2="-60" />
          </g>
        </svg>
        <div className="relative flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 fill-lime-500 text-lime-500" />
          <span className="text-xs font-bold tracking-[0.12em] text-lime-500 uppercase">
            At a glance
          </span>
        </div>
        <p className="text-ink-inverse-50 relative mt-5 max-w-3xl text-xl leading-[1.9] font-semibold sm:text-2xl lg:text-[26px]">
          エンジニアとして
          <span className="mx-1 text-4xl leading-none font-black text-lime-500 sm:text-5xl">
            {years.number}
          </span>
          年、
          <span className="mx-1 text-4xl leading-none font-black text-lime-500 sm:text-5xl">
            {techs.number}
          </span>
          の技術に触れながら
          <span className="mx-1 text-4xl leading-none font-black text-lime-500 sm:text-5xl">
            {certs.number}
          </span>
          つのクラウド資格を取得してきました。
        </p>
      </div>
    </div>
  )
}

export default About
