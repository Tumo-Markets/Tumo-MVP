import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { KEYWORD, SITE_DESCRIPTION, SITE_TITLE, SITE_URL, THUMBNAIL } from 'src/constant/metadata';
import { LexendFont } from 'src/constant';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: KEYWORD,
  publisher: 'A-Star Group',
  robots: {
    follow: true,
    index: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_TITLE,
    countryName: 'Vietnam',
    images: {
      url: SITE_URL + THUMBNAIL.src,
      secureUrl: THUMBNAIL.src,
      type: 'image/png',
      width: THUMBNAIL.width,
      height: THUMBNAIL.height,
    },
  },
  twitter: {
    card: 'summary_large_image',
    site: '@site',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: {
      url: SITE_URL + THUMBNAIL.src,
      secureUrl: THUMBNAIL.src,
      type: 'image/png',
      width: THUMBNAIL.width,
      height: THUMBNAIL.height,
    },
  },
  appleWebApp: {
    capable: true,
    title: SITE_TITLE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KJ4LZ39Z');`}
        </Script>
        {/* End Google Tag Manager */}
      </head>
      <body className={`${LexendFont.className} antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KJ4LZ39Z"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
      </body>
    </html>
  );
}
