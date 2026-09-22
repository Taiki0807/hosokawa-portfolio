import { Zap, ArrowRight } from 'lucide-react'
import { profile } from '@/data'

const chips: { label: string; top: string; left?: string; right?: string; rotate: string }[] = [
  { label: 'Next.js', top: '24px', left: '20px', rotate: '-rotate-6' },
  { label: 'TypeScript', top: '96px', right: '10px', rotate: 'rotate-3' },
  { label: 'React', top: '190px', left: '0px', rotate: 'rotate-2' },
  { label: 'AWS', top: '250px', right: '40px', rotate: '-rotate-3' },
  { label: 'GCP', top: '320px', left: '90px', rotate: 'rotate-3' },
  { label: 'C++', top: '60px', left: '170px', rotate: '-rotate-1' },
]

const Hero = () => {
  return (
    <div
      id="home"
      className="relative mx-auto flex max-w-[1200px] flex-col items-center justify-center gap-10 overflow-hidden px-6 py-16 sm:px-10 lg:flex-row lg:gap-16 lg:px-20 lg:py-24"
    >
      <div className="z-10 flex max-w-xl flex-col gap-6">
        <div className="flex items-center gap-2">
          <Zap className="fill-brand-500 text-brand-500 h-3.5 w-3.5" />
          <span className="text-brand-500 text-xs font-bold tracking-[0.12em] uppercase">
            Full-stack Engineer · Tokyo
          </span>
        </div>
        <h1 className="text-ink-950 text-4xl leading-[1.15] font-black sm:text-5xl lg:text-[56px]">
          初めまして、
          <br />
          <span className="from-brand-400 to-brand-700 bg-linear-to-r bg-clip-text text-transparent">
            {profile.name}
          </span>
          です
        </h1>
        <p className="text-ink-600 max-w-lg text-base leading-[1.7]">{profile.bio}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <a
            href="#projects"
            className="text-ink-950 inline-flex items-center gap-2 rounded-full bg-lime-500 px-7 py-[14px] text-[13px] font-bold tracking-[0.06em] uppercase transition-transform hover:-translate-y-0.5"
          >
            View projects
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#contact"
            className="border-ink-600 text-ink-950 hover:border-brand-500 hover:text-brand-500 inline-flex items-center gap-2 rounded-2xl border-[1.5px] px-[27px] py-[13px] text-[13px] font-bold tracking-[0.06em] uppercase transition-colors"
          >
            Contact me
          </a>
        </div>
      </div>

      <div className="relative flex h-[380px] w-[380px] flex-none items-center justify-center sm:h-[420px] sm:w-[460px]">
        <div className="absolute h-[380px] w-[380px] rounded-full bg-[#0a0913]" />
        <img
          src="/hero-globe.svg"
          alt=""
          className="hero-globe absolute h-[380px] w-[380px]"
          aria-hidden="true"
        />
        {chips.map((chip) => (
          <div
            key={chip.label}
            className={`chip text-ink-950 absolute inline-flex items-center rounded-full bg-white px-4 py-2 text-[13px] font-bold shadow-[0_12px_24px_-12px_rgba(16,14,24,0.18)] ${chip.rotate}`}
            style={{ top: chip.top, left: chip.left, right: chip.right }}
          >
            {chip.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Hero
