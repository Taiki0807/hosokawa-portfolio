import Link from 'next/link'
import Logo from '@/components/Helper/Logo'
import { contact, profile } from '@/data'
import { NavLinks } from '@/Constant/Constant'

const Footer = () => {
  return (
    <footer className="border-t border-purple-100 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          {/* ロゴ + 概要 */}
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-gray-500">{profile.bio}</p>
          </div>

          {/* ナビリンク */}
          <div>
            <div className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
              Navigation
            </div>
            <ul className="space-y-2">
              {NavLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition hover:text-purple-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SNS / 連絡先 */}
          <div>
            <div className="mb-3 text-xs font-bold tracking-wider text-gray-400 uppercase">
              Connect
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-gray-600 transition hover:text-purple-600"
                >
                  Email
                </a>
              </li>
              <li>
                <a
                  href={contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 transition hover:text-purple-600"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={contact.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 transition hover:text-purple-600"
                >
                  X (Twitter)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
          <p className="font-mono text-xs text-gray-400">Built with Next.js & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
