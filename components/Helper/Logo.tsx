import Link from 'next/link'
import { Terminal } from 'lucide-react'

const Logo = () => {
  return (
    <Link href="/" className="group flex items-center space-x-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 transition-colors group-hover:bg-purple-500">
        <Terminal className="h-6 w-6 text-white" />
      </div>
      <h1 className="hidden font-bold text-gray-900 transition-colors group-hover:text-purple-600 sm:block sm:text-xl md:text-2xl">
        {'Hosokawa-lab'}
      </h1>
    </Link>
  )
}

export default Logo
