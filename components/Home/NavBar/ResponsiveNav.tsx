'use client'
import Nav from './Nav'
import MobileNav from './MobileNav'
import AdminBar from './AdminBar'
import { useOwnerSummary } from './useOwnerSummary'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

// 独自のレイアウトを持つページでは公開ナビを出さない
const HIDDEN_PREFIXES = ['/login', '/forbidden', '/admin']

const ResponsiveNav = () => {
  const [showNav, setSnowNav] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const owner = session?.user?.login ? session.user : null
  const summary = useOwnerSummary(Boolean(owner))
  const openNavHandler = () => setSnowNav(true)
  const closeNavHandler = () => setSnowNav(false)

  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null

  return (
    <>
      {owner ? <AdminBar /> : null}
      <Nav openNav={openNavHandler} owner={owner} openInquiries={summary?.openInquiries ?? null} />
      <MobileNav showNav={showNav} closeNav={closeNavHandler} isOwner={Boolean(owner)} />
    </>
  )
}

export default ResponsiveNav
