import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div style={{ maxWidth:680, margin:'0 auto', padding:'80px 40px' }}>
        <div style={{ marginBottom:12 }}>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:2 }}>CONTACT</span>
        </div>
        <h1 style={{ fontFamily:"'Cormorant',serif", fontSize:'clamp(40px,6vw,64px)', fontWeight:300, color:'var(--ink)', letterSpacing:-1.5, lineHeight:.95, marginBottom:20 }}>Get in Touch</h1>
        <p style={{ fontSize:16, color:'var(--ink5)', fontWeight:300, lineHeight:1.7, marginBottom:48, maxWidth:480 }}>
          For advertising inquiries, editorial corrections, partnership opportunities or general questions about PulseAfrica.
        </p>

        <div style={{ display:'grid', gap:16 }}>

          <div style={{ background:'var(--pearl)', borderRadius:16, padding:'28px 32px', border:'1px solid var(--lace)' }}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:2, marginBottom:10 }}>GENERAL ENQUIRIES</div>
            <a href="mailto:honoremugisha@gmail.com" style={{ fontFamily:"'Cormorant',serif", fontSize:24, color:'var(--ink)', textDecoration:'none', fontWeight:400 }}>
              honoremugisha54@gmail.com
            </a>
          </div>

          <div style={{ background:'var(--pearl)', borderRadius:16, padding:'28px 32px', border:'1px solid var(--lace)' }}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:2, marginBottom:10 }}>ADVERTISING & PARTNERSHIPS</div>
            <a href="mailto:honoremugisha@gmail.com" style={{ fontFamily:"'Cormorant',serif", fontSize:24, color:'var(--ink)', textDecoration:'none', fontWeight:400 }}>
              honoremugisha@gmail.com
            </a>
          </div>

          <div style={{ background:'var(--pearl)', borderRadius:16, padding:'28px 32px', border:'1px solid var(--lace)' }}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:2, marginBottom:10 }}>PRIVACY & DATA</div>
            <a href="mailto:honoremugisha@gmail.com" style={{ fontFamily:"'Cormorant',serif", fontSize:24, color:'var(--ink)', textDecoration:'none', fontWeight:400 }}>
              honoremugisha@gmail.com
            </a>
          </div>

          <div style={{ background:'var(--pearl)', borderRadius:16, padding:'28px 32px', border:'1px solid var(--lace)' }}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:2, marginBottom:10 }}>BASED IN</div>
            <div style={{ fontFamily:"'Cormorant',serif", fontSize:24, color:'var(--ink)', fontWeight:400 }}>
              Kigali, Rwanda 🇷🇼
            </div>
          </div>

        </div>

        <div style={{ marginTop:48, padding:'24px 32px', borderRadius:12, background:'linear-gradient(135deg,var(--ruby5),var(--amber6))', border:'1px solid var(--lace)' }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink6)', letterSpacing:2, marginBottom:8 }}>RESPONSE TIME</div>
          <p style={{ fontSize:15, color:'var(--ink4)', fontWeight:300, margin:0, lineHeight:1.6 }}>
            We aim to respond to all enquiries within 48 hours. For urgent corrections to published articles, please include the article URL in your message.
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}