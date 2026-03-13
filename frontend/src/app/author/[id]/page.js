import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getAuthorById, AUTHORS } from '@/lib/authors'
import Navbar from '@/components/Navbar'
import ArticleCard from '@/components/ArticleCard'
import Footer from '@/components/Footer'
import Link from 'next/link'

export async function generateMetadata({ params }) {
  const author = getAuthorById(params.id)
  if (!author) return { title: 'Author Not Found | PulseAfrica' }
  return {
    title: `${author.name} | PulseAfrica`,
    description: author.bio,
  }
}

const CAT_COLORS = {
  politics:'var(--ruby)', sports:'var(--jade)', entertainment:'var(--violet)',
  africa:'var(--copper2)', technology:'var(--sap)', business:'var(--amber)'
}

export default async function AuthorPage({ params }) {
  const author = getAuthorById(params.id)
  if (!author) notFound()

  const { data: articles } = await supabase()
    .from('articles')
    .select('*')
    .eq('author_id', author.id)
    .order('published_at', { ascending: false })
    .limit(12)

  const articleCount = articles?.length || 0
  const categories = [...new Set((articles || []).map(a => a.category))]

  return (
    <>
      <Navbar />

      <div style={{ maxWidth:1380, margin:'0 auto', padding:'60px 40px 40px', position:'relative', zIndex:10 }}>

        {/* Breadcrumb */}
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:2, marginBottom:32 }}>
          <Link href="/" style={{ color:'var(--ink7)', textDecoration:'none' }}>HOME</Link>
          <span> · </span>
          <span style={{ color: author.color }}>AUTHOR</span>
        </div>

        <div style={{ display:'flex', gap:40, alignItems:'flex-start', marginBottom:56, flexWrap:'wrap' }}>

          {/* Avatar */}
          <div style={{
            width:120, height:120, borderRadius:24,
            background:`linear-gradient(145deg,${author.color},var(--ink2))`,
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0, boxShadow:'var(--sh4)',
          }}>
            <span style={{ fontFamily:"'Cormorant',serif", fontSize:44, fontWeight:500, color:'#fff' }}>{author.avatar}</span>
          </div>

          {/* Info */}
          <div style={{ flex:1, minWidth:280 }}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color: author.color, letterSpacing:2.5, marginBottom:8, textTransform:'uppercase' }}>
              AI JOURNALIST · PULSEAFRICA
            </div>
            <h1 style={{ fontFamily:"'Cormorant',serif", fontSize:'clamp(36px,5vw,56px)', fontWeight:400, color:'var(--ink)', lineHeight:1, marginBottom:8 }}>
              {author.name}
            </h1>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'var(--ink6)', letterSpacing:1.5, marginBottom:16 }}>
              {author.title}
            </p>
            <p style={{ fontSize:15, color:'var(--ink4)', lineHeight:1.8, fontWeight:300, maxWidth:600, marginBottom:20 }}>
              {author.bio}
            </p>

            {/* Stats */}
            <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
              {[
                [articleCount, 'ARTICLES'],
                [categories.length || author.specialties.length, 'CATEGORIES'],
                [3, 'LANGUAGES'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily:"'Cormorant',serif", fontSize:32, fontWeight:500, color:'var(--ink)' }}>{n}</div>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink7)', letterSpacing:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink7)', letterSpacing:2, marginBottom:4 }}>COVERS</div>
            {author.specialties.map(s => (
              <Link key={s} href={`/category/${s}`} style={{
                padding:'6px 16px', borderRadius:100,
                background:'var(--pearl)', border:'1px solid var(--lace)',
                fontFamily:"'Space Mono',monospace", fontSize:9,
                color: CAT_COLORS[s], letterSpacing:1.5, textDecoration:'none',
                textTransform:'uppercase',
              }}>{s}</Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:32 }}>
          <div style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--silk),transparent)' }} />
          <div style={{ fontFamily:"'Cormorant',serif", fontSize:13, fontStyle:'italic', color:'var(--ink6)', letterSpacing:4 }}>
            Latest by {author.name.split(' ')[0]}
          </div>
          <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,var(--silk))' }} />
        </div>

        {/* Articles grid */}
        {articleCount === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--ink7)', fontFamily:"'Space Mono',monospace", fontSize:11 }}>
            No articles yet — check back after the next publish cycle
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {(articles || []).map(a => (
              <ArticleCard key={a.id} article={{ ...a, title: a.title_en }} lang="en" />
            ))}
          </div>
        )}
      </div>

      {/* All authors strip */}
      <div style={{ maxWidth:1380, margin:'0 auto', padding:'0 40px 80px' }}>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink7)', letterSpacing:2, marginBottom:20 }}>OTHER JOURNALISTS</div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {AUTHORS.filter(a => a.id !== author.id).map(a => (
            <Link key={a.id} href={`/author/${a.id}`} style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 16px',
              borderRadius:12, background:'var(--pure)', border:'1px solid var(--lace)',
              boxShadow:'var(--sh1)', textDecoration:'none',
            }}>
              <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(145deg,${a.color},var(--ink2))`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontFamily:"'Cormorant',serif", fontSize:14, fontWeight:500, color:'#fff' }}>{a.avatar}</span>
              </div>
              <div>
                <div style={{ fontFamily:"'Cormorant',serif", fontSize:14, fontWeight:500, color:'var(--ink)' }}>{a.name}</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink7)', letterSpacing:1 }}>{a.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </>
  )
}
