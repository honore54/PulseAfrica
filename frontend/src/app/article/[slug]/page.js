import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import Footer from '@/components/Footer'
import AdBanner from '@/components/AdBanner'
import ArticleImage from '@/components/ArticleImage'
import Link from 'next/link'

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
  const slug = params.slug

  const { data: article, error } = await supabase()
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !article) notFound()

  const t = lang === 'fr' ? 'fr' : lang === 'rw' ? 'rw' : 'en'
  const title   = article[`title_${t}`]   || article.title_en   || ''
  const summary = article[`summary_${t}`] || article.summary_en || ''
  const content = article[`content_${t}`] || article.content_en || ''
  const cat = CAT_META[article.category] || CAT_META.africa

  let related = []
  try {
    const { data } = await supabase()
      .from('articles')
      .select(`id, slug, category, image_url, published_at, views, read_time, title_${t}, summary_${t}`)
      .eq('category', article.category)
      .neq('slug', slug)
      .order('published_at', { ascending: false })
      .limit(3)
    related = (data || []).map(a => ({
      ...a,
      title:   a[`title_${t}`]   || '',
      summary: a[`summary_${t}`] || '',
    }))
  } catch {}

  return (
    <>
      <Navbar lang={lang} />

      <article style={{ maxWidth:780, margin:'0 auto', padding:'48px 40px 80px', position:'relative', zIndex:10 }}>

        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:28, fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:2 }}>
          <Link href="/" style={{ color:'var(--ink7)', textDecoration:'none' }}>HOME</Link>
          <span>·</span>
          <Link href={`/category/${article.category}`} style={{ color:cat.color, textDecoration:'none' }}>{cat.label.toUpperCase()}</Link>
        </div>

        <div style={{ marginBottom:16 }}>
          <span className={`chip chip-${article.category}`}>{cat.emoji} {cat.label.toUpperCase()}</span>
        </div>

        <h1 style={{ fontFamily:"'Cormorant',serif", fontWeight:400, fontSize:'clamp(32px,5vw,58px)', lineHeight:1.05, color:'var(--ink)', letterSpacing:-1, marginBottom:20 }}>{title}</h1>

        {summary && (
          <p style={{ fontSize:18, color:'var(--ink4)', lineHeight:1.7, fontWeight:300, marginBottom:28, fontStyle:'italic', borderLeft:`3px solid ${cat.color}`, paddingLeft:18 }}>{summary}</p>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32, paddingBottom:20, borderBottom:'1px solid var(--lace)' }}>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:1.5 }}>
            {new Date(article.published_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}
          </span>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)' }}>·</span>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:1.5 }}>{article.read_time} MIN READ</span>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)' }}>·</span>
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:1.5 }}>📍 {article.location}</span>
          <div style={{ marginLeft:'auto', display:'flex', gap:4 }}>
            {[['en','EN'],['fr','FR'],['rw','RW']].map(([code,label]) => (
              <Link key={code} href={`/article/${slug}?lang=${code}`} style={{
                padding:'3px 8px', borderRadius:5,
                fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:700,
                background: lang===code ? 'var(--ink)' : 'transparent',
                color: lang===code ? '#fff' : 'var(--ink6)',
                border:`1px solid ${lang===code ? 'var(--ink)' : 'var(--lace)'}`,
                textDecoration:'none',
              }}>{label}</Link>
            ))}
          </div>
        </div>

        {article.image_url && (
          <div style={{ borderRadius:16, overflow:'hidden', marginBottom:36, boxShadow:'var(--sh3)', position:'relative' }}>
            <ArticleImage src={article.image_url} alt={title} category={article.category} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 60%,rgba(255,255,255,.6) 100%)' }} />
          </div>
        )}

        <div style={{ fontSize:17, lineHeight:1.85, color:'var(--ink3)', fontWeight:300 }}
          dangerouslySetInnerHTML={{ __html: renderContent(content) }} />

        {article.tags?.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:40, paddingTop:24, borderTop:'1px solid var(--lace)' }}>
            {article.tags.map(tag => (
              <span key={tag} style={{ padding:'4px 12px', borderRadius:100, background:'var(--pearl)', border:'1px solid var(--lace)', fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink6)', letterSpacing:1.5 }}>#{tag}</span>
            ))}
          </div>
        )}

        <div style={{ marginTop:32 }}><AdBanner size="rectangle" /></div>
      </article>

      {related.length > 0 && (
        <div style={{ maxWidth:1380, margin:'0 auto', padding:'0 40px 80px', position:'relative', zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
            <div style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--silk),transparent)' }} />
            <div style={{ fontFamily:"'Cormorant',serif", fontSize:13, fontStyle:'italic', color:'var(--ink6)', letterSpacing:4 }}>More from {cat.label}</div>
            <div style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--silk),transparent)' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {related.map(a => <ArticleCard key={a.id} article={a} lang={lang} />)}
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        article h2 { font-family:'Cormorant',serif; font-size:28px; font-weight:500; color:var(--ink); margin:36px 0 14px; line-height:1.2; }
        article h3 { font-family:'Cormorant',serif; font-size:22px; font-weight:500; color:var(--ink2); margin:28px 0 10px; }
        article p  { margin-bottom:20px; }
        article blockquote { border-left:3px solid ${cat.color}; padding:12px 20px; margin:24px 0; background:${cat.light}; border-radius:0 8px 8px 0; font-style:italic; color:var(--ink3); }
        article strong { font-weight:600; color:var(--ink); }
      `}</style>
    </>
  )
}