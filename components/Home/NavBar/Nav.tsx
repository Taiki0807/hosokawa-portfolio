import Logo from '@/components/Helper/Logo'
import { NavLinks, ContactLink } from '@/Constant/Constant'
import { MenuIcon } from 'lucide-react'
import Link from 'next/link'

type Props = {
  openNav: () => void
}

const Nav = ({ openNav }: Props) => {
  return (
    <div className="border-surface-200 bg-surface-0 sticky top-0 z-50 w-full border-b">
      <div className="mx-auto flex items-center justify-between px-6 py-5 sm:px-10 lg:px-20">
        <Logo />
        <div className="hidden items-center gap-10 lg:flex">
          {NavLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-ink-950 hover:text-brand-500 text-sm font-medium transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={ContactLink.href}
            className="border-ink-600 text-ink-950 hover:border-brand-500 hover:text-brand-500 hidden items-center gap-2 rounded-2xl border-[1.5px] px-[27px] py-[13px] text-[13px] font-bold tracking-[0.06em] uppercase transition-colors lg:inline-flex"
          >
            {ContactLink.name}
          </Link>
          <MenuIcon onClick={openNav} className="text-ink-950 h-7 w-7 cursor-pointer lg:hidden" />
        </div>
      </div>
    </div>
  )
}

export default Nav
