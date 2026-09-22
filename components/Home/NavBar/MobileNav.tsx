import { NavLinks, ContactLink } from '@/Constant/Constant'
import { X } from 'lucide-react'
import Link from 'next/link'

type Props = {
  showNav: boolean
  closeNav: () => void
}
const MobileNav = ({ showNav, closeNav }: Props) => {
  const sidebarOpenClose = showNav ? 'translate-x-0' : 'translate-x-[-100%]'
  return (
    <div>
      <div
        onClick={closeNav}
        className={`fixed ${sidebarOpenClose} bg-surface-950/70 inset-0 z-100 h-screen w-full transform transition-all duration-500`}
      />
      <div
        className={`fixed ${sidebarOpenClose} bg-surface-950 text-ink-inverse-50 z-101 flex h-full w-[80%] transform flex-col justify-center gap-6 px-4 transition-all delay-100 duration-500 sm:w-[60%]`}
      >
        {NavLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            onClick={closeNav}
            className="border-ink-inverse-400/40 text-ink-inverse-50 ml-8 w-fit border-b-[1.5px] pb-1 text-[20px] font-bold transition-colors hover:text-lime-500 sm:text-[28px]"
          >
            {link.name}
          </Link>
        ))}
        <Link
          href={ContactLink.href}
          onClick={closeNav}
          className="text-ink-950 mt-4 ml-8 flex w-fit items-center gap-2 rounded-2xl bg-lime-500 px-6 py-3 text-[13px] font-bold tracking-[0.06em] uppercase"
        >
          {ContactLink.name}
        </Link>
        <X
          onClick={closeNav}
          className="text-ink-inverse-50 absolute top-5 right-6 h-6 w-6 cursor-pointer sm:h-8 sm:w-8"
        />
      </div>
    </div>
  )
}

export default MobileNav
