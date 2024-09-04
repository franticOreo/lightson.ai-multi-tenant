import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Gutter } from '../Gutter'

import classes from './index.module.scss'

export default function Header() {
  const router = useRouter();
  const pathname = router.pathname;
  const unAuthenticatedPaths = ['/', '/join-waitlist', '/signup', '/login']

  return (
    <header className={classes.header}>
      <Gutter className={classes.wrap}>
        {/* <Link href="/"> */}
      <picture>
            <img
              className={classes.logo}
              alt="lightson.ai text Logo"
              src="https://lightsonaimedia.nyc3.cdn.digitaloceanspaces.com/public/li_logo_text_long.svg"
            />
          </picture>
        {/* </Link> */}
        <nav className={classes.nav}>
          {unAuthenticatedPaths.includes(pathname) ? (
            <Link href={'/join-waitlist'} className={classes.button}>Sign Up</Link>
          ) : null}
        </nav>
      </Gutter>
    </header>
  )
}
