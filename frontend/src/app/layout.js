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

        {/* Adsterra Native Banner script — loads quietly */}
        <script
          async
          data-cfasync="false"
          src="https://pl29072546.profitablecpmratenetwork.com/6504f9b6647c3fbed07e1e8d57f0d892/invoke.js"
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

        {/* Adsterra Banner scripts — load after page */}
        <Script id="adsterra-300x250" strategy="lazyOnload">
          {`
            atOptions = {
              'key' : '88a98201e929bca18285796130de047d',
              'format' : 'iframe',
              'height' : 250,
              'width' : 300,
              'params' : {}
            };
          `}
        </Script>
        <Script
          src="https://www.highperformanceformat.com/88a98201e929bca18285796130de047d/invoke.js"
          strategy="lazyOnload"
        />

        <Script id="adsterra-320x50" strategy="lazyOnload">
          {`
            atOptions = {
              'key' : '5dab8a6165ad6f6c7573b276bf447626',
              'format' : 'iframe',
              'height' : 50,
              'width' : 320,
              'params' : {}
            };
          `}
        </Script>
        <Script
          src="https://www.highperformanceformat.com/5dab8a6165ad6f6c7573b276bf447626/invoke.js"
          strategy="lazyOnload"
        />

        {/* Heaven atmospheric lights */}
        <div className="heaven" aria-hidden="true">
          <div className="h-apex" />
          <div className="h-amber" />
          <div className="h-azure" />
          <div className="h-rose" />
          <div className="h-jade" />
        </div>

        {children}

        {/* Adsterra Native Banner — bottom of page, after content */}
        <div
          id="container-6504f9b6647c3fbed07e1e8d57f0d892"
          style={{
            textAlign: 'center',
            margin: '20px auto',
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        />

        {/* Adsterra 320x50 mobile sticky bottom */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '320px',
          height: '50px',
          zIndex: 999,
          display: 'block',
        }}>
        </div>

        <CookieBanner />
      </body>
    </html>
  )
}
