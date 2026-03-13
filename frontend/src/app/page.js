'use client'
import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import ArticleCard, { ArticleRow, SkeletonCard } from '@/components/ArticleCard'
import Footer from '@/components/Footer'
import AdBanner from '@/components/AdBanner'

const CATS = [
  { id:'politics',      emoji:'🏛️', color:'var(--ruby)',    light:'var(--ruby5)',    label:'Politics'      },
  { id:'sports',        emoji:'⚽', color:'var(--jade)',    light:'var(--jade5)',    label:'Sports'        },
  { id:'entertainment', emoji:'🎬', color:'var(--violet)',  light:'var(--violet4)', label:'Entertainment' },
  { id:'africa',        emoji:'🌍', color:'var(--copper2)', light:'var(--copper5)', label:'Africa News'   },
  { id:'technology',    emoji:'💻', color:'var(--sap)',     light:'var(--sap5)',    label:'Technology'    },
  { id:'business',      emoji:'📈', color:'var(--amber)',   light:'var(--amber6)',  label:'Business'      },
]

const CAT_COLORS = {
  politics:'var(--ruby2)', sports:'var(--jade)', entertainment:'var(--violet)',
  africa:'var(--copper2)', technology:'var(--sap)', business:'var(--amber)'
}

function useCountUp(target, delay = 500) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      let c = 0; const step = target / 60
      const iv = setInterval(() => {
        c += step; if (c >= target) { c = target; clearInterval(iv) }
        setVal(Math.floor(c))
      }, 22)
      return () => clearInterval(iv)
    }, delay)
    return () => clearTimeout(t)
  }, [target, delay])
  return val
}

function useCountdown(initial = 21600) {
  const [secs, setSecs] = useState(initial)
  useEffect(() => {
    const iv = setInterval(() => setSecs(s => s > 0 ? s - 1 : 21600), 1000)
    return () => clearInterval(iv)
  }, [])
  const h = String(Math.floor(secs/3600)).padStart(2,'0')
  const m = String(Math.floor(secs%3600/60)).padStart(2,'0')
  const s = String(secs%60).padStart(2,'0')
  return `${h}:${m}:${s}`
}

function fmtViews(n) {
  return n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n || 0)
}

// ── Most Read Today Widget ──────────────────────────────
function MostReadToday({ lang }) {
  const [mostRead, setMostRead] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/most-read')
      .then(r => r.json())
      .then(d => { setMostRead(d.articles || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ background:'var(--pure)', borderRadius:16, border:'1px solid rgba(12,26,58,.06)', boxShadow:'var(--sh2)', overflow:'hidden' }}>
      <div style={{ padding:'14px 18px 12px', borderBottom:'1px solid rgba(12,26,58,.05)', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:14 }}>🔥</span>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:3, color:'var(--ink7)', textTransform:'uppercase' }}>Most Read Today</span>
        <span style={{ marginLeft:'auto', fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink8)', background:'var(--pearl)', padding:'2px 8px', borderRadius:100, border:'1px solid var(--lace)' }}>
          {new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
        </span>
      </div>

      {loading ? (
        Array(5).fill(0).map((_, i) => (
          <div key={i} style={{ display:'flex', gap:12, padding:'12px 18px', borderBottom:'1px solid rgba(12,26,58,.04)' }}>
            <div className="skel" style={{ width:22, height:28, borderRadius:4 }} />
            <div style={{ flex:1 }}>
              <div className="skel" style={{ height:14, marginBottom:5 }} />
              <div className="skel" style={{ height:10, width:'50%' }} />
            </div>
          </div>
        ))
      ) : mostRead.length === 0 ? (
        <div style={{ padding:'24px 18px', textAlign:'center', fontSize:12, color:'var(--ink7)' }}>
          No articles yet today
        </div>
      ) : (
        mostRead.map((a, i) => (
          <a key={a.id} href={`/article/${a.slug}?lang=${lang}`} style={{
            display:'flex', alignItems:'flex-start', gap:12, padding:'12px 18px',
            borderBottom:'1px solid rgba(12,26,58,.04)', textDecoration:'none',
            transition:'background .2s', position:'relative',
          }}
            onMouseEnter={e => e.currentTarget.style.background='var(--mist)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            {/* Rank number */}
            <div style={{
              fontFamily:"'Cormorant',serif", fontSize:28, fontWeight:300, fontStyle:'italic',
              color: i === 0 ? 'var(--amber3)' : i === 1 ? 'var(--ink8)' : 'var(--silk)',
              lineHeight:1, flexShrink:0, width:22, paddingTop:2,
            }}>{i+1}</div>

            {/* Thumbnail */}
            {a.image_url && (
              <img src={a.image_url} alt={a.title_en} style={{ width:52, height:40, objectFit:'cover', borderRadius:6, flexShrink:0 }} />
            )}

            <div style={{ flex:1, minWidth:0 }}>
              {/* Category */}
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:7.5, fontWeight:700, letterSpacing:1.5, color: CAT_COLORS[a.category], textTransform:'uppercase', marginBottom:3 }}>
                {CATS.find(c=>c.id===a.category)?.emoji} {a.category}
              </div>
              {/* Title */}
              <div style={{ fontFamily:"'Cormorant',serif", fontSize:13.5, fontWeight:500, color:'var(--ink2)', lineHeight:1.3, marginBottom:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                {a.title_en}
              </div>
              {/* Views */}
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink8)' }}>
                  👁 {fmtViews(a.views)} views
                </span>
                {i === 0 && (
                  <span style={{ fontFamily:"'Space Mono',monospace", fontSize:7, color:'var(--amber)', background:'var(--amber6)', border:'1px solid var(--amber4)', padding:'1px 6px', borderRadius:100 }}>
                    #1 TODAY
                  </span>
                )}
              </div>
            </div>
          </a>
        ))
      )}

      <a href="/category/africa" style={{ display:'block', padding:'10px 18px', textAlign:'center', fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink6)', letterSpacing:2, textDecoration:'none', borderTop:'1px solid var(--lace)', transition:'background .2s' }}
        onMouseEnter={e => e.currentTarget.style.background='var(--pearl)'}
        onMouseLeave={e => e.currentTarget.style.background='transparent'}
      >
        VIEW ALL STORIES →
      </a>
    </div>
  )
}

export default function HomePage() {
  const [articles, setArticles]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [lang, setLang]             = useState('en')
  const [catCounts, setCatCounts]   = useState({})
  const [barAnimate, setBarAnimate] = useState(false)

  const n1 = useCountUp(17, 600)
  const n2 = useCountUp(54, 700)
  const n3 = useCountUp(3, 800)
  const n4 = useCountUp(6, 900)
  const countdown = useCountdown(5 * 3600 + 14 * 60 + 37)

  const fetchArticles = useCallback(async (newLang = 'en') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/articles?lang=${newLang}&limit=20`)
      const data = await res.json()
      setArticles(data.articles || [])
      const counts = {}
      ;(data.articles || []).forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1 })
      setCatCounts(counts)
    } catch (e) { console.error(e) }
    setLoading(false)
    setTimeout(() => setBarAnimate(true), 800)
  }, [])

  useEffect(() => { fetchArticles('en') }, [fetchArticles])
  const handleLangChange = (l) => { setLang(l); fetchArticles(l) }

  const featured   = articles[0]
  const secondary  = articles.slice(1, 5)
  const tertiary   = articles.slice(5, 9)
  const listItems  = articles.slice(0, 8)
  const trending   = [...articles].sort((a,b) => (b.views||0) - (a.views||0)).slice(0, 5)

  return (
    <>
      <Navbar lang={lang} onLangChange={handleLangChange} />

      {/* ── HERO ── */}
      <div className="hero-wrap" style={{ maxWidth:1380, margin:'0 auto', padding:'76px 40px 60px', position:'relative', zIndex:10 }}>
        <div className="hero-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28, animation:'fadeUp .7s ease both' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 13px', borderRadius:100, background:'var(--pure)', border:'1px solid var(--lace)', boxShadow:'var(--sh1)', fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink5)', letterSpacing:2 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--jade2)', boxShadow:'0 0 8px var(--jade3)', animation:'pulse 2s infinite', display:'inline-block' }} />
                AI-CURATED · EVERY 6 HOURS
              </div>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--lace),transparent)' }} />
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 13px', borderRadius:100, background:'var(--amber6)', border:'1px solid rgba(176,121,0,.2)', fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--amber)', letterSpacing:2 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--amber2)', animation:'pulse 2s infinite', display:'inline-block' }} />
                🇷🇼 KINYARWANDA
              </div>
            </div>

            <h1 style={{ fontFamily:"'Cormorant',serif", fontWeight:300, fontSize:'clamp(62px,8vw,112px)', lineHeight:.9, letterSpacing:-2, marginBottom:26, animation:'fadeUp .75s .1s ease both' }}>
              <span style={{ display:'block', color:'var(--ink)' }}>Africa's</span>
              <span style={{ display:'block', fontStyle:'italic', fontWeight:300, background:'linear-gradient(115deg,var(--amber) 0%,var(--amber2) 35%,#f0c030 65%,var(--amber2) 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', filter:'drop-shadow(0 2px 16px rgba(176,121,0,.18))' }}>
                Pulse,
              </span>
              <span style={{ display:'block', color:'var(--ink5)', fontWeight:300 }}>illuminated.</span>
            </h1>

            <p style={{ fontSize:16, color:'var(--ink5)', lineHeight:1.78, fontWeight:300, maxWidth:480, marginBottom:44, animation:'fadeUp .75s .2s ease both' }}>
              Autonomous AI tracks 847 sources across 54 nations — writing deep-insight articles published in English, Français and Ikinyarwanda. Every six hours, without pause.
            </p>

            <div style={{ display:'flex', gap:0, animation:'fadeUp .75s .3s ease both' }}>
              {[[n1,'K','Articles'],[n2,'','Countries'],[n3,'','Languages'],[n4,'h','Cycle']].map(([n,u,l],i) => (
                <div key={l} style={{ paddingRight:i<3?36:0, marginRight:i<3?36:0, borderRight:i<3?'1px solid var(--lace)':'none' }}>
                  <div style={{ fontFamily:"'Cormorant',serif", fontSize:50, fontWeight:500, color:'var(--ink)', lineHeight:1, display:'flex', alignItems:'baseline', gap:2 }}>
                    {n}<em style={{ fontSize:24, color:'var(--amber2)', fontStyle:'italic' }}>{u}</em>
                  </div>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink7)', letterSpacing:2.5, marginTop:5, textTransform:'uppercase' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-right-col" style={{ animation:'fadeUp .75s .15s ease both' }}>
            {loading ? (
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', bottom:-14, left:18, right:-10, top:7, borderRadius:22, background:'var(--pearl)', border:'1px solid var(--lace)', zIndex:-2 }} />
                <div style={{ position:'absolute', bottom:-7, left:9, right:-5, top:3.5, borderRadius:22, background:'var(--mist)', border:'1px solid var(--lace)', zIndex:-1 }} />
                <div style={{ borderRadius:22, overflow:'hidden', background:'var(--pure)', boxShadow:'var(--sh4)' }}>
                  <div className="skel" style={{ height:270 }} />
                  <div style={{ padding:'22px 26px 26px' }}>
                    <div className="skel" style={{ height:20, width:'38%', marginBottom:10 }} />
                    <div className="skel" style={{ height:22, marginBottom:8 }} />
                    <div className="skel" style={{ height:14, width:'55%' }} />
                  </div>
                </div>
              </div>
            ) : featured ? (
              <div style={{ position:'relative', cursor:'pointer' }} onClick={() => window.location.href=`/article/${featured.slug}?lang=${lang}`}>
                <div style={{ position:'absolute', bottom:-14, left:18, right:-10, top:7, borderRadius:22, background:'var(--pearl)', border:'1px solid var(--lace)', zIndex:-2 }} />
                <div style={{ position:'absolute', bottom:-7, left:9, right:-5, top:3.5, borderRadius:22, background:'var(--mist)', border:'1px solid var(--lace)', zIndex:-1 }} />
                <div style={{ borderRadius:22, overflow:'hidden', background:'var(--pure)', boxShadow:'var(--sh4)', border:'1px solid rgba(255,255,255,.9)' }}>
                  <div style={{ height:270, overflow:'hidden', position:'relative' }}>
                    <img src={featured.image_url} alt={featured.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 30%,rgba(255,255,255,.5) 65%,var(--pure) 100%)' }} />
                  </div>
                  <div style={{ padding:'22px 26px 26px' }}>
                    <span className={`chip chip-${featured.category}`} style={{ marginBottom:10 }}>
                      {CATS.find(c=>c.id===featured.category)?.emoji} {CATS.find(c=>c.id===featured.category)?.label?.toUpperCase()}
                    </span>
                    <div style={{ fontFamily:"'Cormorant',serif", fontSize:21, fontWeight:500, color:'var(--ink)', lineHeight:1.3, marginBottom:9 }}>{featured.title}</div>
                    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:1.5 }}>
                      {new Date(featured.published_at).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})} · 👁 {featured.views || 0} · {lang.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── BREAKING BANNER ── */}
      {featured && (
        <div className="breaking-wrap" style={{ maxWidth:1380, margin:'0 auto 40px', padding:'0 40px', position:'relative', zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 20px', borderRadius:14, background:'linear-gradient(135deg,rgba(200,18,64,.04),rgba(255,244,248,.6))', border:'1px solid rgba(200,18,64,.1)', boxShadow:'0 2px 16px rgba(200,18,64,.05)' }}>
            <div style={{ background:'var(--ruby2)', color:'#fff', padding:'3px 11px', borderRadius:5, flexShrink:0, fontFamily:"'Space Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:2, boxShadow:'0 2px 10px rgba(200,18,64,.25)', animation:'float 2.5s ease-in-out infinite' }}>
              BREAKING
            </div>
            <div style={{ fontSize:12.5, color:'var(--ink2)', lineHeight:1.4, fontWeight:300 }}>{featured.summary}</div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="content-wrap" style={{ maxWidth:1380, margin:'0 auto', padding:'0 40px', position:'relative', zIndex:10 }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:14 }}>
            <h2 style={{ fontFamily:"'Cormorant',serif", fontSize:27, fontWeight:400, color:'var(--ink)' }}>Top Stories</h2>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink8)', letterSpacing:1.5 }}>{articles.length} ARTICLES</span>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {[['en','🇬🇧 English'],['fr','🇫🇷 Français'],['rw','��🇼 Kinyarwanda']].map(([code,label]) => (
              <button key={code} onClick={() => handleLangChange(code)} style={{
                padding:'7px 16px', borderRadius:8, fontFamily:"'Space Mono',monospace",
                fontSize:10, fontWeight:700, letterSpacing:1.5, cursor:'pointer',
                border:`1px solid ${lang===code ? 'var(--ink)' : 'var(--lace)'}`,
                background: lang===code ? 'var(--ink)' : 'transparent',
                color: lang===code ? '#fff' : 'var(--ink6)',
                transition:'all .2s',
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div className="grid-primary" style={{ display:'grid', gridTemplateColumns:'1.65fr 1fr 1fr', gridTemplateRows:'auto auto', gap:14 }}>
          {loading ? (
            <><SkeletonCard big /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              {featured && <ArticleCard article={featured} big lang={lang} />}
              {secondary.map((a,i) => <ArticleCard key={a.id} article={a} lang={lang} />)}
            </>
          )}
        </div>

        <div style={{ marginTop:20 }}><AdBanner size="leaderboard" /></div>

        {tertiary.length > 0 && (
          <div className="grid-sec" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginTop:14 }}>
            {loading
              ? Array(4).fill(0).map((_,i) => <SkeletonCard key={i} />)
              : tertiary.map(a => <ArticleCard key={a.id} article={a} lang={lang} />)
            }
          </div>
        )}

        {/* ── CATEGORY TILES ── */}
        <div style={{ display:'flex', alignItems:'center', gap:20, margin:'56px 0 28px' }}>
          <div style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--silk),transparent)' }} />
          <div style={{ fontFamily:"'Cormorant',serif", fontSize:13, fontStyle:'italic', color:'var(--ink6)', letterSpacing:4, textTransform:'uppercase', whiteSpace:'nowrap' }}>Browse by Category</div>
          <div style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--silk),transparent)' }} />
        </div>

        <div className="cat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
          {CATS.map((cat,i) => (
            <a key={cat.id} href={`/category/${cat.id}`} style={{
              borderRadius:16, padding:'22px 14px 18px', textAlign:'center',
              background:`linear-gradient(160deg,var(--pure),${cat.light})`,
              border:'1px solid rgba(12,26,58,.05)', boxShadow:'var(--sh1)',
              cursor:'pointer', textDecoration:'none', color:'inherit', display:'block',
              transition:'all .3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='var(--sh3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--sh1)'; }}
            >
              <span style={{ fontSize:28, display:'block', marginBottom:8 }}>{cat.emoji}</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:2, color:cat.color, textTransform:'uppercase', display:'block', marginBottom:4 }}>{cat.label}</span>
              <span style={{ fontSize:11, color:'var(--ink7)', display:'block' }}>{catCounts[cat.id] || 0} article{catCounts[cat.id]!==1?'s':''}</span>
            </a>
          ))}
        </div>

        {/* ── LATEST + SIDEBAR ── */}
        <div style={{ display:'flex', alignItems:'center', gap:20, margin:'56px 0 28px' }}>
          <div style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--silk),transparent)' }} />
          <div style={{ fontFamily:"'Cormorant',serif", fontSize:13, fontStyle:'italic', color:'var(--ink6)', letterSpacing:4, textTransform:'uppercase', whiteSpace:'nowrap' }}>Latest Stories</div>
          <div style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--silk),transparent)' }} />
        </div>

        <div className="two-col" style={{ display:'grid', gridTemplateColumns:'1fr 332px', gap:32 }}>

          {/* Article list */}
          <div>
            {loading
              ? Array(6).fill(0).map((_,i) => (
                  <div key={i} style={{ display:'flex', gap:16, padding:'16px 0', borderBottom:'1px solid rgba(12,26,58,.05)' }}>
                    <div className="skel" style={{ width:86, height:63, borderRadius:10, flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div className="skel" style={{ height:11, width:'30%', marginBottom:6 }} />
                      <div className="skel" style={{ height:16, marginBottom:5 }} />
                      <div className="skel" style={{ height:11, width:'50%' }} />
                    </div>
                  </div>
                ))
              : listItems.map(a => <ArticleRow key={a.id} article={a} lang={lang} />)
            }
            <div style={{ marginTop:24 }}><AdBanner size="rectangle" /></div>
          </div>

          {/* Sidebar */}
          <div className="sidebar" style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* ── MOST READ TODAY ── */}
            <MostReadToday lang={lang} />

            {/* AI Engine Status */}
            <div style={{ background:'var(--pure)', borderRadius:16, border:'1px solid rgba(12,26,58,.06)', boxShadow:'var(--sh2)', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px 12px', borderBottom:'1px solid rgba(12,26,58,.05)', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--jade2)', boxShadow:'0 0 8px var(--jade3)', animation:'pulse 2s infinite', display:'inline-block' }} />
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:3, color:'var(--ink7)', textTransform:'uppercase' }}>AI Engine Status</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 18px 10px', background:'linear-gradient(135deg,var(--jade5),var(--pure))', borderBottom:'1px solid rgba(10,143,108,.06)' }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--jade2)', boxShadow:'0 0 8px var(--jade3)', animation:'pulse 1.8s infinite', display:'inline-block', flexShrink:0 }} />
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink5)' }}>NEXT CYCLE IN {countdown}</span>
              </div>
              {[
                ['Sources Tracked','847','linear-gradient(90deg,var(--sap2),var(--sap3))', barAnimate?85:0],
                ['Articles Generated', articles.length, 'linear-gradient(90deg,var(--jade),var(--jade2))', barAnimate?Math.min((articles.length/20)*100,100):0],
                ['Avg SEO Score','9.4/10','linear-gradient(90deg,var(--amber),var(--amber3))', barAnimate?94:0],
                ['Languages Active','EN·FR·RW','linear-gradient(90deg,var(--ruby2),var(--ruby3))', barAnimate?100:0],
              ].map(([name,val,grad,w]) => (
                <div key={name} style={{ padding:'10px 18px', borderBottom:'1px solid rgba(12,26,58,.04)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:11, color:'var(--ink4)' }}>{name}</span>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'var(--sap2)' }}>{val}</span>
                  </div>
                  <div style={{ height:3, background:'var(--ivory)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:2, background:grad, width:`${w}%`, transition:'width 2s cubic-bezier(.4,0,.2,1)' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Trending */}
            <div style={{ background:'var(--pure)', borderRadius:16, border:'1px solid rgba(12,26,58,.06)', boxShadow:'var(--sh2)', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px 12px', borderBottom:'1px solid rgba(12,26,58,.05)', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--amber2)', boxShadow:'0 0 8px var(--amber4)', animation:'pulse 2s infinite', display:'inline-block' }} />
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:3, color:'var(--ink7)', textTransform:'uppercase' }}>Trending Now</span>
              </div>
              {(loading ? Array(5).fill(null) : trending).map((a, i) => (
                loading ? (
                  <div key={i} style={{ display:'flex', gap:12, padding:'12px 18px', borderBottom:'1px solid rgba(12,26,58,.04)' }}>
                    <div className="skel" style={{ width:22, height:28, borderRadius:4 }} />
                    <div style={{ flex:1 }}><div className="skel" style={{ height:14, marginBottom:5 }} /><div className="skel" style={{ height:10, width:'50%' }} /></div>
                  </div>
                ) : (
                  <a key={a.id} href={`/article/${a.slug}?lang=${lang}`} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 18px', borderBottom:'1px solid rgba(12,26,58,.04)', textDecoration:'none', transition:'background .2s' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--mist)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    <div style={{ fontFamily:"'Cormorant',serif", fontSize:28, fontWeight:300, fontStyle:'italic', color:'var(--silk)', lineHeight:1, flexShrink:0, width:22, paddingTop:2 }}>{i+1}</div>
                    <div>
                      <div style={{ fontFamily:"'Cormorant',serif", fontSize:13.5, fontWeight:500, color:'var(--ink2)', lineHeight:1.3, marginBottom:3 }}>{a.title}</div>
                      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink8)' }}>🔥 {a.views ? (a.views/1000).toFixed(1)+'K' : 'NEW'} VIEWS</div>
                    </div>
                  </a>
                )
              ))}
            </div>

            <AdBanner size="rectangle" />
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
