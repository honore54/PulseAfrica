import { notFound } from 'next/navigation'
import { getArticleBySlug, getArticles } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import Footer from '@/components/Footer'
import AdBanner from '@/components/AdBanner'
import RelatedList from '@/components/RelatedList'

export const dynamic = 'force-dynamic'

const CAT_META = {
  politics:      { color:'var(--ruby)',    light:'var(--ruby5)',    label:'Politics',      emoji:'🏛️' },
  sports:        { color:'var(--jade)',    light:'var(--jade5)',    label:'Sports',        emoji:'⚽' },
  entertainment: { color:'var(--violet)',  light:'var(--violet4)', label:'Entertainment', emoji:'🎬' },
  africa:        { color:'var(--copper2)', light:'var(--copper5)', label:'Africa',        emoji:'🌍' },
  technology:    { color:'var(--sap)',     light:'var(--sap5)',    label:'Technology',    emoji:'💻' },
  business:      { color:'var(--amber)',   light:'var(--amber6)',  label:'Business',      emoji:'📈' },
}

function renderContent(text = '') {
  if (!text) return ''
  return text
    .split('\n')
    .map(line => {
      if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`
      if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`
      if (line.startsWith('> ')) return `<blockquote>${line.slice(2)}</blockquote>`
      if (line.trim()) return `<p>${line.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')}</p>`
      return ''
    })
    .join('')
}

export default async function ArticlePage({ params, searchParams }) {
  const lang = searchParams?.lang || 'en'
  let article

  try {
    article = await getArticleBySlug(params.slug, lang)
  } catch {
    notFound()
  }

  const cat = CAT_META[article.category] || CAT_META.africa

  // Related articles
  let related = []
  try {
    const data = await getArticles({ category: article.category, lang, limit: 4 })
    related = data.filter(a => a.slug !== params.slug).slice(0, 3)
  } catch {}

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' })

  return (
    <>
      <Navbar lang={lang} />

      <article style={{ maxWidth:1380, margin:'0 auto', padding:'60px 40px 0', position:'relative', zIndex:10 }}>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 332px', gap:48, alignItems:'start' }}>

          {/* Main article */}
          <div>
            {/* Category + meta */}
            <div style={{ marginBottom:16 }}>
              <span className={`chip chip-${article.category}`}>{cat.emoji} {cat.label.toUpperCase()}</span>
            </div>

            {/* Title */}
            <h1 style={{ fontFamily:"'Cormorant',serif", fontWeight:500, fontSize:'clamp(28px,4vw,46px)', color:'var(--ink)', lineHeight:1.1, letterSpacing:-1, marginBottom:20 }}>
              {article.title}
            </h1>

            {/* Meta bar */}
            <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:32, flexWrap:'wrap' }}>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:1.5 }}>📍 {article.location}</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:1.5 }}>📅 {fmtDate(article.published_at)}</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:1.5 }}>⏱ {article.read_time || 4} min read</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:1.5 }}>👁 {article.views} views</span>

              {/* Lang selector */}
              <div style={{ display:'flex', gap:5, marginLeft:'auto' }}>
                {[['en','EN'],['fr','FR'],['rw','RW']].map(([code,label]) => (
                  <a key={code} href={`/article/${params.slug}?lang=${code}`} style={{
                    padding:'3px 9px', borderRadius:6,
                    fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:1,
                    background: lang===code ? 'var(--ink)' : 'transparent',
                    color: lang===code ? '#fff' : 'var(--ink7)',
                    border:`1px solid ${lang===code ? 'var(--ink)' : 'var(--lace)'}`,
                    textDecoration:'none', transition:'all .2s',
                  }}>{label}</a>
                ))}
              </div>
            </div>

            {/* Hero image */}
            <div style={{ borderRadius:20, overflow:'hidden', marginBottom:36, boxShadow:'var(--sh4)', position:'relative' }}>
              <img
                src={article.image_url}
                alt={article.title}
                style={{ width:'100%', height:440, objectFit:'cover', display:'block', filter:'brightness(.97) saturate(1.1)' }}
              />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 50%,rgba(255,255,255,.5) 80%,var(--pure) 100%)' }} />
            </div>

            {/* Summary callout */}
            {article.summary && (
              <div style={{ padding:'18px 22px', background:'var(--mist)', borderRadius:12, borderLeft:`3px solid ${cat.color}`, marginBottom:28, fontSize:16, color:'var(--ink3)', lineHeight:1.7, fontFamily:"'Cormorant',serif", fontStyle:'italic', fontWeight:400 }}>
                {article.summary}
              </div>
            )}

            {/* Article body */}
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
            />

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:32, paddingTop:24, borderTop:'1px solid var(--lace)' }}>
                {article.tags.map(t => (
                  <span key={t} style={{ padding:'4px 12px', borderRadius:100, background:'var(--pearl)', border:'1px solid var(--lace)', fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink6)', letterSpacing:1 }}>#{t}</span>
                ))}
              </div>
            )}

            <div style={{ marginTop:32 }}><AdBanner size="leaderboard" /></div>
          </div>

          {/* Sidebar */}
          <div style={{ position:'sticky', top:84, display:'flex', flexDirection:'column', gap:20 }}>
            {related.length > 0 && (
              <RelatedList related={related} lang={lang} />
            )}
            <AdBanner size="rectangle" />
          </div>
        </div>
      </article>

      {/* Related grid */}
      {related.length > 0 && (
        <div style={{ maxWidth:1380, margin:'60px auto 0', padding:'0 40px', position:'relative', zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:22 }}>
            <h3 style={{ fontFamily:"'Cormorant',serif", fontSize:27, fontWeight:400, color:'var(--ink)' }}>More in {cat.label}</h3>
            <div style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--lace),transparent)' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {related.map(a => <ArticleCard key={a.id} article={a} lang={lang} />)}
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
