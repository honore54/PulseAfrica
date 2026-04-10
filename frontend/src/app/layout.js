import './globals.css'
import CookieBanner from '@/components/CookieBanner'
import Script from 'next/script'

export const metadata = {
  title: 'PulseAfrica — Africa\'s News, Illuminated',
  description: 'Independent news covering 54 African nations 24/7. Deep analysis published in English, Français and Ikinyarwanda.',
  keywords: 'Africa news, African politics, Africa sports, Africa technology, African business',
  openGraph: {
    title: 'PulseAfrica — Africa\'s News, Illuminated',
    description: 'Independent African news in 3 languages, updated every 6 hours.',
    type: 'website',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
  verification: {
    google: '-F4cxzhPgg-hB2t_Ph5JKsOfVeS9W2WpBgmutBtI1NA',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5287640072959856"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NSYRBWBDE8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NSYRBWBDE8');
          `}
        </Script>

        {/* Heaven atmospheric lights */}
        <div className="heaven" aria-hidden="true">
          <div className="h-apex" />
          <div className="h-amber" />
          <div className="h-azure" />
          <div className="h-rose" />
          <div className="h-jade" />
        </div>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
