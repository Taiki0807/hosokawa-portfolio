import Logo from '@/components/Helper/Logo'
import { NavLinks } from '@/Constant/Constant'
import { MenuIcon } from 'lucide-react'
import Link from 'next/link'

type Props = {
  openNav: () => void
}

const Nav = ({ openNav }: Props) => {
  return (
    <div className="fixed z-100 h-[12vh] w-full transition-all duration-200">
      <div className="mx-auto flex h-full w-[90%] items-center justify-between xl:w-[80%]">
        <Logo />
        <div className="hidden items-center gap-10 lg:flex">
          {NavLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="font-semibold text-black transition-all duration-200 hover:text-purple-600"
            >
              <p>{link.name}</p>
            </Link>
          ))}
        </div>
        <MenuIcon onClick={openNav} className="h-8 w-8 cursor-pointer text-black lg:hidden" />
      </div>
    </div>
  )
}

export default Nav
