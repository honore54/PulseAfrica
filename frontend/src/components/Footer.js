"use client"
import Link from 'next/link'

const CATS = [
  { id:'politics', emoji:'🏛️', label:'Politics' },
  { id:'sports', emoji:'⚽', label:'Sports' },
  { id:'entertainment', emoji:'🎬', label:'Entertainment' },
  { id:'africa', emoji:'🌍', label:'Africa News' },
  { id:'technology', emoji:'💻', label:'Technology' },
  { id:'business', emoji:'📈', label:'Business' },
]

export default function Footer() {
  return (
    <footer style={{
      marginTop: 96, padding: '64px 40px 28px',
      background: 'var(--pearl)', borderTop: '1px solid var(--lace)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Soft light from above */}
      <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'120%', height:200, background:'radial-gradient(ellipse at 50% 0%,rgba(200,220,255,.22) 0%,transparent 70%)', pointerEvents:'none' }} />
      {/* Gold rule */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent 5%,var(--amber4) 35%,var(--amber3) 50%,var(--amber4) 65%,transparent 95%)' }} />

      <div style={{ maxWidth:1380, margin:'0 auto', position:'relative', zIndex:1 }}>
        <div className="foot-grid" style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr 1fr', gap:48, marginBottom:48 }}>
          
          <div>
            <div style={{ fontFamily:"'Cormorant',serif", fontSize:32, fontWeight:400, color:'var(--ink)', letterSpacing:.5, marginBottom:12 }}>PulseAfrica</div>
            <p style={{ fontSize:13, lineHeight:1.78, color:'var(--ink5)', fontWeight:300, marginBottom:16 }}>
              AI-powered news tracking 54 African nations 24/7. Deep analysis published automatically every 6 hours in English, Français and Ikinyarwanda.
            </p>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['🇬🇧 English','🇫🇷 Français','🇷🇼 Kinyarwanda'].map(l => (
                <span key={l} style={{ padding:'4px 10px', borderRadius:6, background:'var(--pure)', border:'1px solid var(--lace)', fontFamily:"'Space Mono',monospace", fontSize:8.5, fontWeight:700, letterSpacing:1, color:'var(--ink6)' }}>{l}</span>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8.5, letterSpacing:3, color:'var(--ink8)', marginBottom:16, textTransform:'uppercase' }}>Categories</div>
            {CATS.map(c => (
              <Link key={c.id} href={`/category/${c.id}`} style={{ display:'block', fontSize:13, color:'var(--ink5)', marginBottom:9, textDecoration:'none', fontWeight:300, transition:'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--ink5)'}
              >{c.emoji} {c.label}</Link>
            ))}
          </div>

          <div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8.5, letterSpacing:3, color:'var(--ink8)', marginBottom:16, textTransform:'uppercase' }}>Company</div>
            {['About PulseAfrica','How It Works','Advertise With Us','Contact'].map(t => (
              <Link key={t} href="/about" style={{ display:'block', fontSize:13, color:'var(--ink5)', marginBottom:9, textDecoration:'none', fontWeight:300 }}>{t}</Link>
            ))}
          </div>

          <div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8.5, letterSpacing:3, color:'var(--ink8)', marginBottom:16, textTransform:'uppercase' }}>Legal</div>
            {[['Privacy Policy','/privacy'],['Terms of Service','/about'],['Cookie Policy','/privacy']].map(([t,h]) => (
              <Link key={t} href={h} style={{ display:'block', fontSize:13, color:'var(--ink5)', marginBottom:9, textDecoration:'none', fontWeight:300 }}>{t}</Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop:'1px solid var(--lace)', paddingTop:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink8)', letterSpacing:1 }}>© 2025 PULSEAFRICA · AI-GENERATED NEWS & ANALYSIS</span>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink8)', letterSpacing:1 }}>BUILT WITH CLAUDE AI · NEXT.JS · SUPABASE · VERCEL</span>
        </div>
      </div>
    </footer>
  )
}
