import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

export function Footer() {

  return (
    <footer className="bg-secondary text-secondary-color border-t border-accent-2">
      <div className="container mx-auto px-5">
        <div className="py-28 flex flex-col lg:flex-row items-center">
          <div className="flex flex-col lg:flex-row justify-center items-center lg:pl-4 lg:w-1/2">
            <div className="mx-3 text-center">
              <h3 className="text-2xl tracking-normal font-bold payback-font">
              lightson.ai
              </h3>
              <p className="my-2">Sydney, Australia</p>
              <a
                href={`mailto:admin@lightson.ai`}
                className="block my-2"
              >
                email: admin@lightson.ai
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description: string;
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={inter.className}
    >
      <body>
        <section className="min-h-screen">
          <main>{children}</main>
          <Footer />
        </section>
      </body>
    </html>
  );
}
