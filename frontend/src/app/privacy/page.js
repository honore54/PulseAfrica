import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'Privacy Policy — PulseAfrica' }

export default function PrivacyPage() {
  return (
    <>
      <Navbar lang="en" />
      <div style={{ maxWidth:800, margin:'0 auto', padding:'80px 40px', position:'relative', zIndex:10 }}>
        <h1 style={{ fontFamily:"'Cormorant',serif", fontWeight:300, fontSize:'clamp(40px,5vw,60px)', color:'var(--ink)', lineHeight:.95, letterSpacing:-1.5, marginBottom:32 }}>Privacy Policy</h1>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:1.5, marginBottom:40 }}>LAST UPDATED: MARCH 2026</div>
        <div className="article-body">

          <p>This Privacy Policy explains how PulseAfrica ("we", "us", "our") collects, uses and protects information when you visit pulse-africa.vercel.app ("the Site"). By using the Site, you agree to the practices described in this policy.</p>

          <h2>1. Information We Collect</h2>
          <p>We collect two types of information:</p>
          <p><strong>Information you provide:</strong> When you contact us via our contact form, we collect your name and email address solely to respond to your inquiry. We do not store this information beyond what is necessary to respond.</p>
          <p><strong>Information collected automatically:</strong> When you visit the Site, we automatically collect anonymous usage data including page views, time spent on pages, geographic region (country level only), browser type, device type and referral source. This data is collected through Google Analytics and is fully anonymized — we cannot identify individual users from this data.</p>

          <h2>2. Cookies</h2>
          <p>We use the following types of cookies:</p>
          <p><strong>Essential cookies:</strong> Required for the Site to function. These include your language preference (English, French or Kinyarwanda) which is stored locally in your browser.</p>
          <p><strong>Analytics cookies:</strong> Google Analytics uses cookies to collect anonymous traffic data. These cookies help us understand how visitors use the Site so we can improve it. No personally identifiable information is collected.</p>
          <p><strong>Advertising cookies:</strong> Google AdSense uses cookies to serve relevant advertisements based on your interests. Google may use information about your visits to this and other websites to show you relevant ads. You can opt out of personalized advertising at <a href="https://www.google.com/settings/ads" style={{ color:'var(--sap)' }}>Google Ad Settings</a>.</p>
          <p>You can control and delete cookies through your browser settings at any time. Note that disabling cookies may affect the functionality of the Site.</p>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <p>— Operate and improve the Site and its content</p>
          <p>— Analyze traffic patterns and reader behavior to improve user experience</p>
          <p>— Respond to inquiries submitted through our contact form</p>
          <p>— Serve relevant advertisements through Google AdSense</p>
          <p>— Comply with legal obligations</p>

          <h2>4. Third-Party Services</h2>
          <p><strong>Google Analytics:</strong> We use Google Analytics to understand Site usage. Google Analytics collects anonymous data and is governed by Google's Privacy Policy. You can opt out of Google Analytics tracking by installing the <a href="https://tools.google.com/dlpage/gaoptout" style={{ color:'var(--sap)' }}>Google Analytics Opt-out Browser Add-on</a>.</p>
          <p><strong>Google AdSense:</strong> We display advertisements served by Google AdSense. Google uses cookies and web beacons to serve ads based on users' prior visits to our website and other websites across the internet. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our Site. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" style={{ color:'var(--sap)' }}>Google Ad Settings</a> or <a href="https://www.aboutads.info" style={{ color:'var(--sap)' }}>www.aboutads.info</a>.</p>
          <p><strong>Unsplash:</strong> Article images are served from Unsplash's CDN. Unsplash may collect standard web server logs in accordance with their own privacy policy.</p>
          <p><strong>Vercel:</strong> Our Site is hosted on Vercel, which may collect server logs including IP addresses for security and performance purposes.</p>

          <h2>5. Data Sharing</h2>
          <p>We do not sell, trade or rent your personal information to third parties. We may share anonymous, aggregated data with third-party analytics providers as described above. We may disclose information if required by law or to protect our rights and the safety of our users.</p>

          <h2>6. Data Retention</h2>
          <p>We do not store personal user data on our servers beyond what is necessary to respond to contact form inquiries. Google Analytics retains anonymized data for 26 months. Any personal information provided through our contact form is deleted after your inquiry is resolved.</p>

          <h2>7. Children's Privacy</h2>
          <p>PulseAfrica is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it immediately.</p>

          <h2>8. Your Rights</h2>
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <p>— The right to access the personal data we hold about you</p>
          <p>— The right to correct inaccurate personal data</p>
          <p>— The right to request deletion of your personal data</p>
          <p>— The right to object to or restrict processing of your data</p>
          <p>— The right to data portability</p>
          <p>To exercise any of these rights, please contact us at honoremugisha54@gmail.com. We will respond to your request within 30 days.</p>

          <h2>9. Security</h2>
          <p>We take reasonable technical and organizational measures to protect your information against unauthorized access, alteration, disclosure or destruction. Our Site is served over HTTPS to encrypt data in transit. However, no method of transmission over the internet is 100% secure and we cannot guarantee absolute security.</p>

          <h2>10. International Users</h2>
          <p>PulseAfrica is operated from Rwanda and serves a global audience. If you are accessing the Site from outside Rwanda, please be aware that your information may be transferred to and processed in countries with different data protection laws. By using the Site, you consent to this transfer.</p>

          <h2>11. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. When we make changes, we will update the "Last Updated" date at the top of this page. We encourage you to review this policy periodically. Your continued use of the Site after changes are posted constitutes your acceptance of the updated policy.</p>

          <h2>12. Contact Us</h2>
          <p>If you have any questions, concerns or requests regarding this Privacy Policy or our data practices, please contact us:</p>
          <p><strong>Email:</strong> honoremugisha54@gmail.com<br/>
          <strong>Website:</strong> pulse-africa.vercel.app<br/>
          <strong>Location:</strong> Kigali, Rwanda</p>

        </div>
      </div>
      <Footer />
    </>
  )
}
