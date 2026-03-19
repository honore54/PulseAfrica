import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'About PulseAfrica' }

export default function AboutPage() {
  return (
    <>
      <Navbar lang="en" />
      <div style={{ maxWidth:800, margin:'0 auto', padding:'80px 40px', position:'relative', zIndex:10 }}>
        <h1 style={{ fontFamily:"'Cormorant',serif", fontWeight:300, fontSize:'clamp(48px,6vw,72px)', color:'var(--ink)', lineHeight:.95, letterSpacing:-1.5, marginBottom:32 }}>
          About<br/><em style={{ background:'linear-gradient(135deg,var(--amber),var(--amber2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PulseAfrica</em>
        </h1>

        <div className="article-body">

          <p>PulseAfrica is an independent digital news publication dedicated to covering Africa's most important stories — from politics and business to sports, technology and culture. We cover all 54 African nations, publishing in English, French and Kinyarwanda to serve the continent's diverse audiences.</p>

          <h2>Our Mission</h2>
          <p>Africa is home to 1.4 billion people and some of the world's fastest-growing economies, yet African stories remain chronically underreported in global media. PulseAfrica exists to change that — delivering timely, accurate and contextual journalism that puts African voices and perspectives at the centre of the story.</p>
          <p>From Kigali to Lagos, from Cairo to Cape Town, we believe every African citizen deserves access to quality news coverage in a language they understand.</p>

          <h2>Our Coverage</h2>
          <p>PulseAfrica covers six core areas of African life: Politics, Business, Sports, Entertainment, Technology and pan-African Affairs. Our editorial team monitors developments across the continent around the clock, identifying the stories that matter most to African readers and the global diaspora.</p>
          <p>Every article published on PulseAfrica is reviewed by our editorial team before publication to ensure accuracy, balance and journalistic integrity.</p>

          <h2>Our Languages</h2>
          <p><strong>English</strong> — Professional, authoritative reporting serving English-speaking audiences across Eastern and Southern Africa and the global African diaspora.</p>
          <p><strong>Français</strong> — Quality French journalism serving Francophone West and Central Africa, written with cultural nuance and local context.</p>
          <p><strong>Ikinyarwanda</strong> — Original Kinyarwanda articles written for Rwandan readers, capturing the voice and context of local journalism.</p>

          <h2>Editorial Standards</h2>
          <p>PulseAfrica is committed to responsible, accurate and balanced journalism. Our editorial team reviews all content for factual accuracy before publication. We do not publish misinformation, sensationalism or unverified claims. When reporting on sensitive topics, we err on the side of caution and present multiple perspectives.</p>
          <p>We are committed to transparency and corrections. If you believe any article contains an error, please contact our editorial team immediately and we will investigate and correct it promptly.</p>

          <h2>Our Team</h2>
          <p>PulseAfrica was founded with the belief that Africa's stories deserve world-class journalism. Our editorial team includes correspondents and editors with deep expertise across African politics, business, sports and culture. Our journalists are guided by the principles of fairness, accuracy and independence.</p>

          <h2>Advertising & Partnerships</h2>
          <p>PulseAfrica is supported by advertising revenue. We maintain a strict separation between our editorial team and our commercial operations. Advertisers have no influence over our editorial decisions or content.</p>
          <p>For advertising inquiries, sponsored content partnerships or media collaborations, please reach out via our contact page.</p>

          <h2>Contact Us</h2>
          <p>We welcome feedback, tips, corrections and partnership inquiries. Our editorial team is committed to engaging with our readers and the communities we serve. Please visit our contact page to get in touch.</p>

        </div>

        {/* Team cards */}
        <div style={{ marginTop:60, paddingTop:40, borderTop:'1px solid var(--lace)' }}>
          <h2 style={{ fontFamily:"'Cormorant',serif", fontSize:32, fontWeight:400, color:'var(--ink)', marginBottom:32 }}>Editorial Team</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20 }}>
            {[
              { name:'Amara Diallo',   title:'Senior Africa Correspondent',     region:'West Africa', avatar:'AD' },
              { name:'Kwame Asante',   title:'Sports & Culture Editor',          region:'East Africa', avatar:'KA' },
              { name:'Nadia Okonkwo', title:'Tech & Business Reporter',          region:'Southern Africa', avatar:'NO' },
              { name:'Ibrahim Hassan', title:'East Africa Bureau Chief',         region:'Horn of Africa', avatar:'IH' },
              { name:'Zainab Mensah',  title:'Entertainment & Lifestyle Writer', region:'West Africa', avatar:'ZM' },
              { name:'Chidi Eze',      title:'Investigations & Analysis',        region:'Central Africa', avatar:'CE' },
            ].map(m => (
              <div key={m.name} style={{ background:'var(--pearl)', borderRadius:14, border:'1px solid var(--lace)', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:10 }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--amber)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Mono',monospace", fontSize:14, fontWeight:700, color:'#fff' }}>
                  {m.avatar}
                </div>
                <div>
                  <p style={{ fontFamily:"'Cormorant',serif", fontSize:18, fontWeight:500, color:'var(--ink)', margin:0 }}>{m.name}</p>
                  <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink6)', margin:'4px 0 0', letterSpacing:1 }}>{m.title}</p>
                  <p style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink8)', margin:'4px 0 0', letterSpacing:1 }}>📍 {m.region}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </>
  )
}
