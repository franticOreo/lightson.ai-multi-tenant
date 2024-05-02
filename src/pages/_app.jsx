import Layout from '../app/_components/layout'

import '../app/_css/app.scss'
 
export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

