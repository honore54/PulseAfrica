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
  politics:      { color:'var(--ruby)',    light:'var(--ruby5)',    label:'Politics',      emoji:'��️' },
  sports:        { color:'var(--jade)',    light:'var(--jade5)',    label:'Sports',        emoji:'⚽' },
  entertainment: { color:'var(--violet)',  light:'var(--violet4)', label:'Entertainment', emoji:'🎬' },
  africa:        { color:'var(--copper2)', light:'var(--copper5)', label:'Africa',        emoji:'🌍' },
  technology:    { color:'var(--sap)',     light:'var(--sap5)',    label:'Technology',    emoji:'💻' },
  business:      { color:'var(--amber)',   light:'var(--amber6)',  label:'Business',      emoji:'📈' },
}

const AUTHOR_META = {
  'amara-diallo':  { name:'Amara Diallo',  title:'Senior Africa Correspondent',    avatar:'AD' },
  'kwame-asante':  { name:'Kwame Asante',  title:'Sports & Culture Editor',        avatar:'KA' },
  'nadia-okonkwo': { name:'Nadia Okonkwo', title:'Tech & Business Reporter',       avatar:'NO' },
  'ibrahim-hassan':{ name:'Ibrahim Hassan',title:'East Africa Bureau Chief',       avatar:'IH' },
  'zainab-mensah': { name:'Zainab Mensah', title:'Entertainment & Lifestyle Writer',avatar:'ZM' },
  'chidi-eze':     { name:'Chidi Eze',     title:'Investigations & Analysis',      avatar:'CE' },
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

export async function generateMetadata({ params, searchParams }) {
  const lang = searchParams?.lang || 'en'
  const slug = params.slug

  const { data: article } = await supabase()
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!article) return { title: 'Article Not Found | PulseAfrica' }

  const t = lang === 'fr' ? 'fr' : lang === 'rw' ? 'rw' : 'en'
  const title   = article[`title_${t}`]   || article.title_en   || ''
  const summary = article[`summary_${t}`] || article.summary_en || ''
  const cat = CAT_META[article.category] || CAT_META.africa
  const author = AUTHOR_META[article.author_id] || null
  const url = `https://pulse-africa.vercel.app/article/${slug}${lang !== 'en' ? `?lang=${lang}` : ''}`
  const image = article.image_url || 'https://pulse-africa.vercel.app/og-default.jpg'
  const keywords = [
    ...(article.tags || []),
    cat.label, 'Africa', 'African News', 'PulseAfrica',
    article.location || '',
  ].filter(Boolean).join(', ')

  return {
    title: `${title} | PulseAfrica`,
    description: summary,
    keywords,
    authors: [{ name: author ? author.name : 'PulseAfrica Editorial Team' }],
    metadataBase: new URL('https://pulse-africa.vercel.app'),
    alternates: { canonical: url },
    openGraph: {
      title, description: summary, url, siteName: 'PulseAfrica',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: lang === 'fr' ? 'fr_FR' : lang === 'rw' ? 'rw_RW' : 'en_US',
      type: 'article',
      publishedTime: article.published_at,
      section: cat.label,
      tags: article.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@PulseAfrica250',
      creator: '@PulseAfrica250',
      title, description: summary, images: [image],
    },
  }
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

  supabase()
    .rpc('increment_views', { article_slug: slug })
    .then(() => {})
    .catch(() => {})

  const t = lang === 'fr' ? 'fr' : lang === 'rw' ? 'rw' : 'en'
  const title   = article[`title_${t}`]   || article.title_en   || ''
  const summary = article[`summary_${t}`] || article.summary_en || ''
  const content = article[`content_${t}`] || article.content_en || ''
  const cat = CAT_META[article.category] || CAT_META.africa
  const author = AUTHOR_META[article.author_id] || null

  let relatedByTags = []
  let relatedByCat = []

  try {
    if (article.tags?.length > 0) {
      const { data } = await supabase()
        .from('articles')
        .select(`id, slug, category, image_url, published_at, views, read_time, title_${t}, summary_${t}`)
        .neq('slug', slug)
        .overlaps('tags', article.tags)
        .order('published_at', { ascending: false })
        .limit(3)
      relatedByTags = (data || []).map(a => ({
        ...a, title: a[`title_${t}`] || '', summary: a[`summary_${t}`] || '',
      }))
    }

    const excludeSlugs = [slug, ...relatedByTags.map(a => a.slug)]
    const { data } = await supabase()
      .from('articles')
      .select(`id, slug, category, image_url, published_at, views, read_time, title_${t}, summary_${t}`)
      .eq('category', article.category)
      .not('slug', 'in', `(${excludeSlugs.map(s => `"${s}"`).join(',')})`)
      .order('published_at', { ascending: false })
      .limit(2)
    relatedByCat = (data || []).map(a => ({
      ...a, title: a[`title_${t}`] || '', summary: a[`summary_${t}`] || '',
    }))
  } catch {}

  const allRelated = [...relatedByTags, ...relatedByCat].slice(0, 5)
  const topRelated = allRelated.slice(0, 3)
  const bottomRelated = allRelated.slice(3)

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

        <div className="article-meta" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20, paddingBottom:20, borderBottom:'1px solid var(--lace)', flexWrap:'wrap' }}>
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

        {/* ── Author byline + Editorial review badge ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:32, padding:'16px 20px', background:'var(--pearl)', borderRadius:12, border:'1px solid var(--lace)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{
              width:40, height:40, borderRadius:'50%',
              background: cat.color, color:'#fff',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:"'Space Mono',monospace", fontSize:11, fontWeight:700, flexShrink:0,
            }}>
              {author ? author.avatar : 'PA'}
            </div>
            <div>
              <p style={{ fontFamily:"'Space Mono',monospace", fontSize:10, fontWeight:700, color:'var(--ink)', margin:0, letterSpacing:0.5 }}>
                {author ? author.name : 'PulseAfrica Staff'}
              </p>
              <p style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink6)', margin:0, letterSpacing:1 }}>
                {author ? author.title : 'Editorial Team'}
              </p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:100, background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.2)' }}>
            <span style={{ fontSize:12 }}>✅</span>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'#059669', letterSpacing:1, fontWeight:700 }}>REVIEWED BY PULSEAFRICA EDITORIAL TEAM</span>
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

        {bottomRelated.length > 0 && (
          <div style={{ margin:'40px 0', padding:'24px', background:'var(--pearl)', borderRadius:16, border:'1px solid var(--lace)' }}>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:2, marginBottom:16 }}>RELATED READING</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {bottomRelated.map(a => (
                <Link key={a.id} href={`/article/${a.slug}?lang=${lang}`} style={{
                  display:'flex', gap:12, textDecoration:'none', color:'inherit',
                  padding:'12px', borderRadius:10, background:'var(--pure)',
                  border:'1px solid var(--lace)', transition:'all .2s',
                }}>
                  {a.image_url && (
                    <img src={a.image_url} alt={a.title} style={{ width:72, height:54, objectFit:'cover', borderRadius:8, flexShrink:0 }} />
                  )}
                  <div>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color: CAT_META[a.category]?.color, letterSpacing:1.5, textTransform:'uppercase' }}>
                      {CAT_META[a.category]?.emoji} {CAT_META[a.category]?.label}
                    </span>
                    <p style={{ fontFamily:"'Cormorant',serif", fontSize:15, fontWeight:500, color:'var(--ink)', lineHeight:1.3, marginTop:4 }}>{a.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {article.tags?.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:40, paddingTop:24, borderTop:'1px solid var(--lace)' }}>
            {article.tags.map(tag => (
              <span key={tag} style={{ padding:'4px 12px', borderRadius:100, background:'var(--pearl)', border:'1px solid var(--lace)', fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink6)', letterSpacing:1.5 }}>#{tag}</span>
            ))}
          </div>
        )}

        <div style={{ marginTop:40, paddingTop:24, borderTop:'1px solid var(--lace)' }}>
          <p style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:1.5, marginBottom:8 }}>SOURCES & REFERENCES</p>
          <p style={{ fontSize:13, color:'var(--ink6)', lineHeight:1.8 }}>
            This article was generated by PulseAfrica's AI engine, inspired by reporting from international news sources including{' '}
            <strong>Reuters</strong>, <strong>BBC Africa</strong>, <strong>Al Jazeera</strong>,{' '}
            <strong>AFP</strong>, and <strong>local African media outlets</strong>.
            PulseAfrica uses AI to generate trilingual news articles covering 54 African nations.
          </p>
        </div>

        <div style={{ marginTop:32 }}><AdBanner size="rectangle" /></div>
      </article>

      {topRelated.length > 0 && (
        <div className="related-grid" style={{ maxWidth:1380, margin:'0 auto', padding:'0 40px 80px', position:'relative', zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
            <div style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--silk),transparent)' }} />
            <div style={{ fontFamily:"'Cormorant',serif", fontSize:13, fontStyle:'italic', color:'var(--ink6)', letterSpacing:4 }}>
              You May Also Like
            </div>
            <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,var(--silk))' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {topRelated.map(a => <ArticleCard key={a.id} article={a} lang={lang} />)}
          </div>
          <div style={{ textAlign:'center', marginTop:32 }}>
            <Link href={`/category/${article.category}?lang=${lang}`} style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'10px 24px', borderRadius:100,
              border:'1px solid var(--lace)', background:'var(--pearl)',
              fontFamily:"'Space Mono',monospace", fontSize:10, color:'var(--ink5)',
              textDecoration:'none', letterSpacing:1.5, transition:'all .2s',
            }}>
              MORE {cat.label.toUpperCase()} NEWS →
            </Link>
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
