'use client'
import Nav from './Nav'
import MobileNav from './MobileNav'
import { useState } from 'react'

const ResponsiveNav = () => {
  const [showNav, setSnowNav] = useState(false)
  const openNavHandler = () => setSnowNav(true)
  const closeNavHandler = () => setSnowNav(false)
  return (
    <div>
      <Nav openNav={openNavHandler} />
      <MobileNav showNav={showNav} closeNav={closeNavHandler} />
    </div>
  )
}

export default ResponsiveNav
