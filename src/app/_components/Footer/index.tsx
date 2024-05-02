import React from 'react'
import Link from 'next/link'

import { Gutter } from '../Gutter'

import classes from './index.module.scss'

export default function Footer() {
  return (
    <footer className={classes.footer}>
      <Gutter className={classes.wrap}>
      <Link href="/">
          <picture>
            <img
              className={classes.logo}
              alt="lightson.ai Logo"
              src="/logo.svg"
            />
          </picture>
        </Link>
        <nav className={classes.nav}>
          <Link href="mailto:admin@lightson.ai" target="_blank" rel="noopener noreferrer">
          admin@lightson.ai
          </Link>
          Sydney, Australia
        </nav>
      </Gutter>
    </footer>
  )
}
