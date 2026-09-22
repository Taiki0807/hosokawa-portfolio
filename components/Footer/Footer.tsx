import Logo from '@/components/Helper/Logo'
import { profile } from '@/data'

const Footer = () => {
  return (
    <footer className="bg-surface-950 border-t border-white/10">
      <div className="flex flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row sm:px-10 lg:px-20">
        <Logo inverted />
        <p className="text-ink-inverse-400 text-xs">
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
