import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import Footer from '@/components/Footer'
import AdBanner from '@/components/AdBanner'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const CAT_META = {
  politics:      { color:'var(--ruby)',    light:'var(--ruby5)',    label:'Politics',      emoji:'🏛️', desc:'Governance, elections and diplomacy across 54 nations.' },
  sports:        { color:'var(--jade)',    light:'var(--jade5)',    label:'Sports',        emoji:'⚽', desc:'Football, athletics and everything that moves Africa.' },
  entertainment: { color:'var(--violet)',  light:'var(--violet4)', label:'Entertainment', emoji:'🎬', desc:'Music, film, culture and the arts shaping the continent.' },
  africa:        { color:'var(--copper2)', light:'var(--copper5)', label:'Africa News',   emoji:'🌍', desc:'Pan-continental stories, development and society.' },
  technology:    { color:'var(--sap)',     light:'var(--sap5)',    label:'Technology',    emoji:'💻', desc:'Startups, fintech, AI and Africa\'s digital revolution.' },
  business:      { color:'var(--amber)',   light:'var(--amber6)',  label:'Business',      emoji:'📈', desc:'Markets, investment, trade and economic growth.' },
}

export default async function CategoryPage({ params, searchParams }) {
  const { category } = await params
  const lang = searchParams?.lang || 'en'
  const cat = CAT_META[category]
  if (!cat) notFound()

  const t = lang === 'fr' ? 'fr' : lang === 'rw' ? 'rw' : 'en'

  let articles = []
  try {
    const { data, error } = await supabase()
      .from('articles')
      .select(`id, slug, category, image_url, published_at, views, read_time, location, tags, title_${t}, summary_${t}`)
      .eq('category', category)
      .order('published_at', { ascending: false })
      .limit(24)

    if (!error && data) {
      articles = data.map(a => ({
        ...a,
        title:   a[`title_${t}`] || '',
        summary: a[`summary_${t}`] || '',
      }))
    }
  } catch (e) {
    console.error('Category fetch error:', e)
  }

  const featured = articles[0]
  const rest = articles.slice(1)

  return (
    <>
      <Navbar lang={lang} />

      <div style={{ background:`linear-gradient(160deg,var(--pure) 0%,${cat.light} 100%)`, borderBottom:'1px solid var(--lace)', padding:'60px 40px 48px', position:'relative', zIndex:10 }}>
        <div style={{ maxWidth:1380, margin:'0 auto' }}>
          <div style={{ marginBottom:12 }}>
            <span className={`chip chip-${category}`}>{cat.emoji} {cat.label.toUpperCase()}</span>
          </div>
          <h1 style={{ fontFamily:"'Cormorant',serif", fontWeight:300, fontSize:'clamp(48px,6vw,80px)', color:'var(--ink)', lineHeight:.95, letterSpacing:-1.5, marginBottom:14 }}>{cat.label}</h1>
          <p style={{ fontSize:16, color:'var(--ink5)', fontWeight:300, maxWidth:480 }}>{cat.desc}</p>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:2, marginTop:16 }}>
            {articles.length} ARTICLES · UPDATED EVERY 6 HOURS
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1380, margin:'0 auto', padding:'48px 40px 0', position:'relative', zIndex:10 }}>
        {articles.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>{cat.emoji}</div>
            <div style={{ fontFamily:"'Cormorant',serif", fontSize:24, color:'var(--ink3)', marginBottom:8 }}>No articles yet</div>
            <div style={{ fontSize:14, color:'var(--ink6)' }}>The AI engine will publish the first {cat.label} article in the next cycle.</div>
          </div>
        ) : (
          <>
            {featured && <div style={{ marginBottom:14 }}><ArticleCard article={featured} big lang={lang} /></div>}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
              {rest.map(a => <ArticleCard key={a.id} article={a} lang={lang} />)}
            </div>
            <div style={{ marginTop:24 }}><AdBanner size="leaderboard" /></div>
          </>
        )}
      </div>

      <Footer />
    </>
  )
}