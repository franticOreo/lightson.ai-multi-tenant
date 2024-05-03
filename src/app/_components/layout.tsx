// import Navbar from './navbar'
import Footer from './Footer'
import Header from './Header'

 
export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}