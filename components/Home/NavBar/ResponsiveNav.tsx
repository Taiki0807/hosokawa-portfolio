'use client'
import Nav from './Nav'
import MobileNav from './MobileNav'
import { useState } from 'react'

const ResponsiveNav = () => {
  const [showNav, setSnowNav] = useState(false)
  const openNavHandler = () => setSnowNav(true)
  const closeNavHandler = () => setSnowNav(false)
  return (
    <>
      <Nav openNav={openNavHandler} />
      <MobileNav showNav={showNav} closeNav={closeNavHandler} />
    </>
  )
}

export default ResponsiveNav
