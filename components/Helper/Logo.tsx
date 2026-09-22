import Link from 'next/link'
import Image from 'next/image'

type Props = {
  inverted?: boolean
}

const Logo = ({ inverted = false }: Props) => {
  if (inverted) {
    return (
      <Link href="/" className="flex items-center">
        <Image src="/logo-mark-dark.svg" alt="Hosokawa Lab" width={26} height={26} />
      </Link>
    )
  }

  return (
    <Link href="/" className="flex items-center">
      <Image src="/logo-lockup.svg" alt="Hosokawa Lab" width={116} height={34} priority />
    </Link>
  )
}

export default Logo
