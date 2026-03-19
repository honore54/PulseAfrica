import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'Terms of Service — PulseAfrica' }

export default function TermsPage() {
  return (
    <>
      <Navbar lang="en" />
      <div style={{ maxWidth:800, margin:'0 auto', padding:'80px 40px', position:'relative', zIndex:10 }}>
        <h1 style={{ fontFamily:"'Cormorant',serif", fontWeight:300, fontSize:'clamp(40px,5vw,60px)', color:'var(--ink)', lineHeight:.95, letterSpacing:-1.5, marginBottom:32 }}>Terms of Service</h1>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:1.5, marginBottom:40 }}>LAST UPDATED: MARCH 2026</div>
        <div className="article-body">

          <p>Welcome to PulseAfrica. By accessing or using pulse-africa.vercel.app ("the Site"), you agree to be bound by these Terms of Service. Please read them carefully before using the Site.</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using PulseAfrica, you accept and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the Site.</p>

          <h2>2. Use of the Site</h2>
          <p>PulseAfrica grants you a limited, non-exclusive, non-transferable license to access and use the Site for personal, non-commercial purposes. You agree not to:</p>
          <p>— Copy, reproduce, distribute or republish any content from the Site without written permission</p>
          <p>— Use the Site for any unlawful purpose or in violation of any applicable laws</p>
          <p>— Attempt to gain unauthorized access to any part of the Site or its systems</p>
          <p>— Use automated tools to scrape, crawl or harvest content from the Site</p>
          <p>— Interfere with or disrupt the integrity or performance of the Site</p>
          <p>— Impersonate PulseAfrica or any of its editorial team members</p>

          <h2>3. Intellectual Property</h2>
          <p>All content published on PulseAfrica — including articles, headlines, summaries, images and design elements — is the intellectual property of PulseAfrica or its licensors. You may share links to our articles but may not reproduce substantial portions of our content without prior written permission.</p>
          <p>Images used on the Site are sourced from Unsplash under their respective licenses. PulseAfrica's logo and branding are proprietary and may not be used without permission.</p>

          <h2>4. Content Accuracy</h2>
          <p>PulseAfrica strives to publish accurate and balanced news content. However, we make no warranties or representations regarding the completeness, accuracy or timeliness of any content on the Site. News information changes rapidly and we encourage readers to verify important information through multiple sources.</p>
          <p>PulseAfrica is not responsible for any decisions made based on content published on the Site.</p>

          <h2>5. Third-Party Links</h2>
          <p>The Site may contain links to third-party websites. These links are provided for your convenience only. PulseAfrica has no control over the content of those sites and accepts no responsibility for them or for any loss or damage that may arise from your use of them.</p>

          <h2>6. Advertising</h2>
          <p>PulseAfrica displays advertisements served by Google AdSense and potentially other advertising networks. These advertisements are clearly distinguished from editorial content. PulseAfrica does not endorse the products or services advertised on the Site. Advertisers have no influence over our editorial decisions or content.</p>

          <h2>7. Disclaimer of Warranties</h2>
          <p>The Site is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. PulseAfrica does not warrant that the Site will be uninterrupted, error-free or free of viruses or other harmful components.</p>

          <h2>8. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, PulseAfrica shall not be liable for any indirect, incidental, special, consequential or punitive damages arising from your use of or inability to use the Site or its content.</p>

          <h2>9. Privacy</h2>
          <p>Your use of the Site is also governed by our Privacy Policy, which is incorporated into these Terms of Service by reference. Please review our Privacy Policy to understand our practices.</p>

          <h2>10. Changes to Terms</h2>
          <p>PulseAfrica reserves the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the Site. Your continued use of the Site after any changes constitutes your acceptance of the new terms.</p>

          <h2>11. Governing Law</h2>
          <p>These Terms of Service shall be governed by and construed in accordance with the laws of Rwanda. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Rwanda.</p>

          <h2>12. Contact</h2>
          <p>If you have any questions about these Terms of Service, please contact us at:<br/>
          <strong>Email:</strong> honoremugisha54@gmail.com<br/>
          <strong>Website:</strong> pulse-africa.vercel.app</p>

        </div>
      </div>
      <Footer />
    </>
  )
}
