import Head from 'next/head';
import Link from 'next/link';
import Layout from '../app/_components/layout'

import '../app/_css/app.scss'
 
export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
      <meta name="facebook-domain-verification" content="7txrtkkx4l73id4sv8895q7wikpf41" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}
