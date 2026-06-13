import Logo from '@/components/Helper/Logo'
import { NavLinks } from '@/Constant/Constant'
import Link from 'next/link'

const Nav = () => {
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
      </div>
    </div>
  )
}

export default Nav
