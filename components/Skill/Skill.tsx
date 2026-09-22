import { Zap, Code2 } from 'lucide-react'
import { skills } from '@/data'

type NodePos = {
  /** SVGのviewBox座標系(640x520)での位置。<line>の端点に使う */
  x: number
  y: number
  /** コンテナ幅に対する%位置。絶対配置のノードdivに使う */
  xPct: number
  yPct: number
  reverse?: boolean
  tipAbove?: boolean
  delay: string
}

// ハブ座標とリング半径は元デザイン(orbit-ring-inner/outer)と同じ値。
// スキル数はdata.tsの増減に追従するよう、円周上に均等配置で自動計算する。
const HUB = { x: 300, y: 250 }

const VIEW_W = 640
const VIEW_H = 520

// コンテナはSVGのviewBoxと同じ 640x520 比率(aspect-ratio)で伸縮するため、
// 絶対配置するノードもpx指定ではなく% (viewBox比)で置く。こうしないとスマホ幅で
// コンテナだけ縮んでもノードは元のpx座標のままはみ出して崩れる。
function ringPositions(count: number, radius: number, startAngleDeg: number): NodePos[] {
  if (count === 0) return []
  return Array.from({ length: count }, (_, i) => {
    const angleDeg = startAngleDeg + (360 / count) * i
    const angleRad = (angleDeg * Math.PI) / 180
    const x = HUB.x + radius * Math.cos(angleRad)
    const y = HUB.y + radius * Math.sin(angleRad)
    return {
      x,
      y,
      xPct: (x / VIEW_W) * 100,
      yPct: (y / VIEW_H) * 100,
      reverse: x < HUB.x,
      tipAbove: y > HUB.y,
      delay: `${(0.05 + i * 0.1).toFixed(2)}s`,
    }
  })
}

const coreSkills = skills.filter((s) => s.hasExperience)
const outerSkills = skills.filter((s) => !s.hasExperience)

const corePositions = ringPositions(coreSkills.length, 160, -75)
const outerPositions = ringPositions(outerSkills.length, 235, -68)

const Skill = () => {
  return (
    <div id="skills" className="px-6 pb-16 sm:px-10 lg:px-20">
      <div className="bg-surface-950 relative flex flex-col items-center gap-14 overflow-hidden rounded-[28px] p-6 sm:p-10 lg:flex-row lg:justify-between lg:p-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
          <div className="absolute -top-36 -right-30 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(122,111,224,0.28),rgba(122,111,224,0)_70%)]" />
        </div>

        <div className="relative z-10 flex max-w-sm flex-none flex-col gap-5">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 fill-lime-500 text-lime-500" />
            <span className="text-xs font-bold tracking-[0.12em] text-lime-500 uppercase">
              Skills
            </span>
          </div>
          <div className="text-ink-inverse-50 text-2xl leading-[1.35] font-black sm:text-[30px]">
            コアは実務で鍛え、
            <br />
            外側へ学びを広げる。
          </div>
          <p className="text-ink-inverse-400 text-sm leading-[1.8]">
            {coreSkills.map((s) => s.name).join('・')}
            は実務で磨いてきたコア技術。そこから{outerSkills.map((s) => s.name).join('・')}
            など、新しい領域へ日々軌道を広げています。
          </p>
          <div className="mt-2 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 flex-none rounded-full bg-lime-500 shadow-[0_0_0_4px_rgba(203,235,77,0.16)]" />
              <span className="text-ink-inverse-50 text-[13px] font-bold">
                実務経験あり — 内側の軌道
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="border-ink-inverse-50/55 h-3 w-3 flex-none rounded-full border-[1.5px]" />
              <span className="text-ink-inverse-400 text-[13px] font-bold">
                学習中 — 外側の軌道
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 aspect-[640/520] w-full max-w-[640px] flex-none">
          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 640 520"
            aria-hidden="true"
          >
            <circle
              className="orbit-ring-inner"
              cx="300"
              cy="250"
              r="160"
              fill="none"
              stroke="#a89dfb"
              strokeOpacity="0.28"
              strokeWidth="1.5"
              strokeDasharray="2 7"
              strokeLinecap="round"
            />
            <circle
              className="orbit-ring-outer"
              cx="300"
              cy="250"
              r="235"
              fill="none"
              stroke="#a89dfb"
              strokeOpacity="0.18"
              strokeWidth="1.5"
              strokeDasharray="2 7"
              strokeLinecap="round"
            />
            <g stroke="#7a6fe0" strokeWidth="1.5" strokeOpacity="0.4">
              {corePositions.map((pos, i) => (
                <line key={i} x1="300" y1="250" x2={pos.x} y2={pos.y} />
              ))}
            </g>
            <g stroke="#7a6fe0" strokeWidth="1" strokeOpacity="0.22">
              {outerPositions.map((pos, i) => (
                <line key={i} x1="300" y1="250" x2={pos.x} y2={pos.y} />
              ))}
            </g>
          </svg>

          <div
            className="skill-hub absolute flex h-[108px] w-[108px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#7a6fe0,#342c7a_75%)]"
            style={{ left: `${(HUB.x / VIEW_W) * 100}%`, top: `${(HUB.y / VIEW_H) * 100}%` }}
          >
            <Code2 className="h-8 w-8 text-lime-500" strokeWidth={1.8} />
          </div>

          {coreSkills.map((skill, i) => {
            const pos = corePositions[i]
            if (!pos) return null
            return (
              <div
                key={skill.name}
                className={`skill-node absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 ${pos.reverse ? 'flex-row-reverse' : ''}`}
                style={{ left: `${pos.xPct}%`, top: `${pos.yPct}%` }}
              >
                <span
                  className="skill-node-dot h-3.5 w-3.5 flex-none rounded-full bg-lime-500 shadow-[0_0_0_6px_rgba(203,235,77,0.16)]"
                  style={{ animationDelay: pos.delay }}
                />
                <span className="text-ink-inverse-50 text-base font-extrabold whitespace-nowrap">
                  {skill.name}
                </span>
                <div className={`skill-tip ${pos.tipAbove ? 'tip-above' : ''}`}>
                  <div className="text-ink-inverse-50 mb-1 text-[13px] font-extrabold">
                    {skill.name}
                  </div>
                  <div className="mb-1 text-[12px] font-bold text-lime-500">実務経験あり</div>
                  <div className="text-ink-inverse-400 text-[12px] leading-[1.5]">
                    {skill.description}
                  </div>
                </div>
              </div>
            )
          })}

          {outerSkills.map((skill, i) => {
            const pos = outerPositions[i]
            if (!pos) return null
            return (
              <div
                key={skill.name}
                className={`skill-node absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 ${pos.reverse ? 'flex-row-reverse' : ''}`}
                style={{ left: `${pos.xPct}%`, top: `${pos.yPct}%` }}
              >
                <span
                  className="skill-node-dot border-ink-inverse-50/55 h-2.5 w-2.5 flex-none rounded-full border-[1.5px]"
                  style={{ animationDelay: pos.delay }}
                />
                <span className="text-ink-inverse-400 text-sm font-semibold whitespace-nowrap">
                  {skill.name}
                </span>
                <div className={`skill-tip ${pos.tipAbove ? 'tip-above' : ''}`}>
                  <div className="text-ink-inverse-50 mb-1 text-[13px] font-extrabold">
                    {skill.name}
                  </div>
                  <div className="text-ink-inverse-50 mb-1 text-[12px] font-bold">学習中</div>
                  <div className="text-ink-inverse-400 text-[12px] leading-[1.5]">
                    {skill.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Skill
