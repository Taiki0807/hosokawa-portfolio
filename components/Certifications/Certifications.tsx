import Image from 'next/image'
import { Zap } from 'lucide-react'
import { certifications } from '@/data'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(date: string) {
  const [year, month] = date.split('-')
  const label = MONTHS[Number(month) - 1]
  return label ? `${label} ${year}` : date
}

function tierOf(name: string) {
  return /professional/i.test(name) ? 'Professional' : 'Associate'
}

const Certifications = () => {
  if (certifications.length === 0) return null

  return (
    <div className="flex flex-col gap-12 px-6 pb-24 sm:px-10 lg:px-20">
      <div className="flex items-center gap-2">
        <Zap className="fill-brand-500 text-brand-500 h-3.5 w-3.5" />
        <span className="text-brand-500 text-xs font-bold tracking-[0.12em] uppercase">
          Certifications
        </span>
      </div>

      <div className="relative grid grid-cols-1 gap-y-12 sm:grid-cols-3">
        <div className="from-brand-200 via-brand-400 to-brand-200 absolute top-[60px] right-[16.66%] left-[16.66%] hidden h-0.5 bg-linear-to-r sm:block" />

        {certifications.map((cert) => {
          const tier = tierOf(cert.name)
          return (
            <a
              key={cert.name}
              href={cert.credentialUrl ?? '#'}
              target={cert.credentialUrl ? '_blank' : undefined}
              rel={cert.credentialUrl ? 'noopener noreferrer' : undefined}
              className="relative z-10 flex flex-col items-center gap-1 text-center"
            >
              <div
                className={`flex h-[120px] w-[120px] items-center justify-center rounded-full p-1.5 ${
                  tier === 'Professional'
                    ? 'bg-[conic-gradient(from_220deg,#cbeb4d,#7a6fe0,#cbeb4d)] shadow-[0_18px_30px_-14px_rgba(203,235,77,0.35)]'
                    : 'bg-[conic-gradient(from_220deg,#7a6fe0,#342c7a,#7a6fe0)] shadow-[0_18px_30px_-14px_rgba(52,44,122,0.45)]'
                }`}
              >
                <div className="bg-surface-0 flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                  {cert.badgeUrl ? (
                    <div className="relative h-[84%] w-[84%]">
                      <Image
                        src={cert.badgeUrl}
                        alt={cert.name}
                        fill
                        sizes="100px"
                        className="object-contain"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <div
                className={`mt-5 text-xs font-bold tracking-[0.1em] uppercase ${
                  tier === 'Professional' ? 'text-[#5c6a12]' : 'text-brand-500'
                }`}
              >
                {tier}
              </div>
              <div className="text-ink-950 max-w-[200px] text-[17px] font-bold">{cert.name}</div>
              <div className="text-ink-600 text-[13px]">{formatDate(cert.date)}</div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default Certifications
