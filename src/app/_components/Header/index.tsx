import React from 'react'
import Link from 'next/link'

import { Gutter } from '../Gutter'

import classes from './index.module.scss'

export default function Header() {
  return (
    <footer className={classes.footer}>
      <Gutter className={classes.wrap}>
        {/* <Link href="/"> */}
        <h3 className={classes.font}>
        lightson.ai
        </h3>
        {/* </Link> */}
        <nav className={classes.nav}>
        </nav>
      </Gutter>
    </footer>
  )
}
