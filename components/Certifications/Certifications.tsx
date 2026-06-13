import Image from 'next/image'
import SectionHeading from '../Helper/SectionHeading'
import { certifications } from '@/data'

const Certifications = () => {
  // 資格が登録されていない場合はセクション自体を表示しない
  if (certifications.length === 0) return null

  return (
    <div className="bg-gray-100 py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-start px-6">
        <SectionHeading
          tag="// Certifications"
          title="保有資格"
          description="取得した認定資格・バッジ一覧です。"
        />

        <div className="flex w-full justify-center">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert) => (
              <a
                key={cert.name}
                href={cert.credentialUrl ?? '#'}
                target={cert.credentialUrl ? '_blank' : undefined}
                rel={cert.credentialUrl ? 'noopener noreferrer' : undefined}
                className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* バッジ画像 */}
                {cert.badgeUrl ? (
                  <div className="relative mb-4 h-20 w-20">
                    <Image
                      src={cert.badgeUrl}
                      alt={cert.name}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-2xl">
                    🏅
                  </div>
                )}

                {/* 資格名 */}
                <h3 className="mb-1 text-base font-bold text-gray-900">{cert.name}</h3>

                {/* 発行元 */}
                <p className="mb-1 text-sm text-gray-500">{cert.issuer}</p>

                {/* 取得日 */}
                <span className="mt-2 inline-block rounded-full border border-purple-200 bg-purple-50 px-3 py-0.5 font-mono text-xs text-purple-600">
                  {cert.date}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Certifications
