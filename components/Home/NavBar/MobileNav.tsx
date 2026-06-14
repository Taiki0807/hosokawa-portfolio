import { NavLinks } from '@/Constant/Constant'
import { X } from 'lucide-react'
import Link from 'next/link'

type Props = {
  showNav: boolean
  closeNav: () => void
}
const mobileNav = ({ showNav, closeNav }: Props) => {
  const sidebarOpenClose = showNav ? 'translate-x-0' : 'translate-x-[-100%]'
  return (
    <div>
      <div
        className={`fixed ${sidebarOpenClose} inset-0 z-1002 h-screen w-full transform bg-black opacity-70 transition-all duration-500`}
      />
      <div
        className={`fixed ${sidebarOpenClose} z-1050 flex h-full w-[80%] transform flex-col justify-center space-y-6 bg-purple-600 text-white transition-all delay-300 duration-500 sm:w-[60%]`}
      >
        {NavLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            onClick={closeNav}
            className="ml-12 w-fit border-b-[1.5px] border-white pb-1 text-[20px] text-white sm:text-[30px]"
          >
            <p>{link.name}</p>
          </Link>
        ))}
        <X
          onClick={closeNav}
          className="absolute top-[0.7rem] right-[1.4rem] h-6 w-6 cursor-pointer sm:h-8 sm:w-8"
        />
      </div>
    </div>
  )
}

export default mobileNav
