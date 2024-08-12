import React from 'react'
import Link from 'next/link'

import { Gutter } from '../Gutter'

import classes from './index.module.scss'

export default function Header() {
  return (
    <footer className={classes.footer}>
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
        </nav>
      </Gutter>
    </footer>
  )
}
