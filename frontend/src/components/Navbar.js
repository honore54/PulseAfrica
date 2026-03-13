'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const CATS = [
  { id: 'all',           emoji: '🌐', label: 'All News',      href: '/' },
  { id: 'politics',      emoji: '🏛️', label: 'Politics',      href: '/category/politics' },
  { id: 'sports',        emoji: '⚽', label: 'Sports',        href: '/category/sports' },
  { id: 'entertainment', emoji: '🎬', label: 'Entertainment', href: '/category/entertainment' },
  { id: 'africa',        emoji: '🌍', label: 'Africa',        href: '/category/africa' },
  { id: 'technology',    emoji: '💻', label: 'Technology',    href: '/category/technology' },
  { id: 'business',      emoji: '📈', label: 'Business',      href: '/category/business' },
]

export default function Navbar({ lang, onLangChange }) {
  const pathname = usePathname()
  const [time, setTime] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', timeZone:'Africa/Kigali' }) + ' CAT')
    }, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      {/* ── Top bar ── */}
      <div className="topbar" style={{
        background: 'var(--pearl)', borderBottom: '1px solid var(--lace)',
        padding: '7px 40px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', fontFamily: "'Space Mono',monospace",
        fontSize: 9, color: 'var(--ink6)', letterSpacing: '2px',
        position: 'relative', zIndex: 50,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, background:'var(--jade5)', border:'1px solid var(--jade4)', padding:'3px 10px', borderRadius:'100px', color:'var(--jade)', fontSize:9 }}>
          <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--jade2)', boxShadow:'0 0 8px var(--jade3)', animation:'pulse 2s infinite', display:'inline-block' }} />
          AI ENGINE LIVE
        </div>
        <span style={{ color:'var(--ink5)' }}>{time}</span>
        <span className="topbar-sources">TRACKING 847 SOURCES · 54 COUNTRIES · 3 LANGUAGES</span>
      </div>

      {/* ── Main nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.88)',
        backdropFilter: 'blur(40px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.6)',
        borderBottom: '1px solid var(--lace)',
        boxShadow: scrolled ? '0 1px 0 #fff, 0 4px 24px rgba(12,26,58,.06)' : '0 1px 0 #fff',
        transition: 'all .3s',
      }}>
        <div style={{ maxWidth:1380, margin:'0 auto', display:'flex', alignItems:'center', height:64, padding:'0 40px' }}>
          
          {/* Logo */}
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:11, textDecoration:'none', marginRight:48, flexShrink:0 }}>
            <div style={{
              width:36, height:36, borderRadius:10, background:'linear-gradient(145deg,var(--ink2),var(--ink))',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 12px rgba(12,26,58,.2)', flexShrink:0, overflow:'hidden',
            }}>
              <span style={{ fontFamily:"'Cormorant',serif", fontSize:20, fontWeight:600, color:'#fff' }}>P</span>
            </div>
            <div>
              <div style={{ fontFamily:"'Cormorant',serif", fontSize:22, fontWeight:500, color:'var(--ink)', letterSpacing:.5, lineHeight:1 }}>PulseAfrica</div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:'var(--ink7)', letterSpacing:2.5, marginTop:2 }}>AI NEWS NETWORK</div>
            </div>
          </Link>

          {/* Desktop category links */}
          <div className="nav-links" style={{ display:'flex', gap:2, flex:1 }}>
            {CATS.map(cat => {
              const active = cat.href === '/' ? pathname === '/' : pathname.startsWith(cat.href)
              return (
                <Link key={cat.id} href={cat.href} style={{
                  padding: '6px 13px', borderRadius: 8, fontSize: 12.5, fontWeight: active ? 500 : 400,
                  color: active ? 'var(--sap)' : 'var(--ink5)', textDecoration: 'none',
                  border: `1px solid ${active ? 'var(--sap4)' : 'transparent'}`,
                  background: active ? 'var(--sap5)' : 'transparent',
                  transition: 'all .2s', whiteSpace: 'nowrap',
                }}>
                  {cat.emoji} {cat.label}
                </Link>
              )
            })}
          </div>

          {/* Desktop language switcher */}
          <div className="hide-mobile" style={{ display:'flex', gap:3, marginLeft:'auto' }}>
            {[['en','EN'],['fr','FR'],['rw','RW']].map(([code, label]) => (
              <button key={code} onClick={() => onLangChange?.(code)} style={{
                padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                fontFamily: "'Space Mono',monospace", fontSize: 9, fontWeight: 700, letterSpacing: 1,
                background: lang === code ? 'var(--ink)' : 'transparent',
                color: lang === code ? '#fff' : 'var(--ink6)',
                border: `1px solid ${lang === code ? 'var(--ink)' : 'var(--lace)'}`,
                transition: 'all .2s',
              }}>{label}</button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>

        {/* Mobile dropdown menu */}
        <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
          {CATS.map(cat => {
            const active = cat.href === '/' ? pathname === '/' : pathname.startsWith(cat.href)
            return (
              <Link key={cat.id} href={cat.href} className={active ? 'active' : ''}>
                {cat.emoji} {cat.label}
              </Link>
            )
          })}
          {/* Mobile language switcher */}
          <div style={{ display:'flex', gap:6, padding:'8px 14px', borderTop:'1px solid var(--lace)', marginTop:4 }}>
            {[['en','EN'],['fr','FR'],['rw','RW']].map(([code, label]) => (
              <button key={code} onClick={() => { onLangChange?.(code); setMenuOpen(false) }} style={{
                padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 700,
                background: lang === code ? 'var(--ink)' : 'var(--pearl)',
                color: lang === code ? '#fff' : 'var(--ink6)',
                border: `1px solid ${lang === code ? 'var(--ink)' : 'var(--lace)'}`,
              }}>{label}</button>
            ))}
          </div>
        </div>
      </nav>

      <Ticker />
    </>
  )
}

function Ticker() {
  const [articles, setArticles] = useState([])
  useEffect(() => {
    fetch('/api/articles?limit=8').then(r => r.json()).then(d => setArticles(d.articles || [])).catch(() => {})
  }, [])

  const CAT_COLORS = { politics:'var(--ruby2)', sports:'var(--jade)', entertainment:'var(--violet)', africa:'var(--copper2)', technology:'var(--sap)', business:'var(--amber)' }
  const items = articles.length ? articles : [
    { category:'politics', title:'African Union seals historic 54-nation climate pact' },
    { category:'sports',   title:'Rwanda qualifies for AFCON 2025 after dramatic victory' },
    { category:'technology', title:'Kigali launches Africa\'s first AI-powered transit network' },
  ]
  const doubled = [...items, ...items]

  return (
    <div style={{ background:'var(--warm0)', borderBottom:'1px solid rgba(12,26,58,.05)', height:36, display:'flex', alignItems:'center', overflow:'hidden', position:'relative', zIndex:49 }}>
      <div style={{ background:'var(--amber5)', borderRight:'1px solid var(--amber4)', color:'var(--amber)', padding:'0 20px 0 28px', height:'100%', display:'flex', alignItems:'center', flexShrink:0, fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:2.5, clipPath:'polygon(0 0,calc(100% - 10px) 0,100% 50%,calc(100% - 10px) 100%,0 100%)' }}>
        LIVE
      </div>
      <div style={{ overflow:'hidden', flex:1 }}>
        <div style={{ display:'flex', whiteSpace:'nowrap', animation:'tickerRun 40s linear infinite' }}>
          {doubled.map((a, i) => (
            <span key={i} style={{ padding:'0 44px', fontSize:11.5, color:'var(--ink5)', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8.5, fontWeight:700, letterSpacing:1.5, color: CAT_COLORS[a.category] || 'var(--ink5)', textTransform:'uppercase' }}>
                {a.category}
              </span>
              <span style={{ width:3, height:3, borderRadius:'50%', background:'var(--ink8)', flexShrink:0, display:'inline-block' }} />
              {a.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
