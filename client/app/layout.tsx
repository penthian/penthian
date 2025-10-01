import NextTopLoader from "nextjs-toploader";
import "@rainbow-me/rainbowkit/styles.css";
import { afacad, newsreader } from "./fonts";
import "./globals.css";

export const metadata = {
  title: "PENTHIAN",
  description: "Penthian is a blockchain‑powered platform where you can invest from $1,000 in tokenized real‑world assets, co‑own income‑generating properties and businesses, earn passive yield, and trade shares on a compliant secondary market.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`overflow-x-hidden !scroll-smooth ${newsreader.variable} ${afacad.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
      </head>
      <body className="text-pitchBlack font-afacad">
          <NextTopLoader color="#143560" height={5} showSpinner={false} />
          {children}
      </body>
    </html>
  );
}
