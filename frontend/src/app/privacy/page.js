import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'Privacy Policy — PulseAfrica' }

export default function PrivacyPage() {
  return (
    <>
      <Navbar lang="en" />
      <div style={{ maxWidth:800, margin:'0 auto', padding:'80px 40px', position:'relative', zIndex:10 }}>
        <h1 style={{ fontFamily:"'Cormorant',serif", fontWeight:300, fontSize:'clamp(40px,5vw,60px)', color:'var(--ink)', lineHeight:.95, letterSpacing:-1.5, marginBottom:32 }}>Privacy Policy</h1>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:1.5, marginBottom:40 }}>LAST UPDATED: JANUARY 2025</div>
        <div className="article-body">
          <h2>Information We Collect</h2>
          <p>PulseAfrica collects minimal data. When you visit our website, we may collect: anonymous page view statistics, your general geographic region (country-level), browser type and device information for analytics purposes.</p>
          <h2>Cookies</h2>
          <p>We use essential cookies to maintain your language preference across sessions. We may use Google Analytics cookies for anonymous traffic analysis. If you consent, Google AdSense may use cookies to serve relevant advertisements.</p>
          <h2>Third-Party Services</h2>
          <p><strong>Google AdSense</strong> — We display advertisements served by Google AdSense. Google may use cookies to serve ads based on your prior visits to our website or other websites. You may opt out at <a href="https://www.google.com/settings/ads" style={{ color:'var(--sap)' }}>Google Ad Settings</a>.</p>
          <p><strong>Unsplash</strong> — Article images are served from Unsplash CDN. Unsplash may collect standard web server logs.</p>
          <h2>Data Retention</h2>
          <p>We do not store personal user data on our servers. Analytics data is anonymized and retained for 26 months by Google Analytics.</p>
          <h2>Your Rights</h2>
          <p>You have the right to access, correct, or delete any personal data we hold about you. To exercise these rights, contact us at privacy@pulseafrica.com.</p>
          <h2>Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated date.</p>
        </div>
      </div>
      <Footer />
    </>
  )
}
