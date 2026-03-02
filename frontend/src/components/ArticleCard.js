'use client'
import Link from 'next/link'
import Image from 'next/image'

const CAT_META = {
  politics:      { color:'var(--ruby)',    light:'var(--ruby5)',    border:'rgba(200,18,64,.14)',   label:'Politics',      emoji:'🏛️' },
  sports:        { color:'var(--jade)',    light:'var(--jade5)',    border:'rgba(10,143,108,.14)',  label:'Sports',        emoji:'⚽' },
  entertainment: { color:'var(--violet)',  light:'var(--violet4)', border:'rgba(109,40,217,.14)',  label:'Entertainment', emoji:'🎬' },
  africa:        { color:'var(--copper2)',  light:'var(--copper5)', border:'rgba(196,94,0,.14)',    label:'Africa',        emoji:'🌍' },
  technology:    { color:'var(--sap)',     light:'var(--sap5)',    border:'rgba(26,86,219,.14)',   label:'Technology',    emoji:'💻' },
  business:      { color:'var(--amber)',   light:'var(--amber6)',  border:'rgba(176,121,0,.14)',   label:'Business',      emoji:'📈' },
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60) return 'Just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

function fmtViews(n) {
  return n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n)
}

export default function ArticleCard({ article, big = false, lang = 'en' }) {
  const cat = CAT_META[article.category] || CAT_META.africa
  const imgHeight = big ? 320 : 170
  const href = `/article/${article.slug}?lang=${lang}`

  return (
    <Link href={href} style={{ textDecoration:'none', color:'inherit', display:'block' }}>
      <article style={{
        background: 'var(--pure)', borderRadius: 18,
        border: '1px solid rgba(12,26,58,.06)',
        boxShadow: 'var(--sh2)', overflow: 'hidden',
        transition: 'transform .32s cubic-bezier(.25,.46,.45,.94), box-shadow .32s',
        position: 'relative', cursor: 'pointer',
        gridRow: big ? 'span 2' : 'auto',
        height: '100%',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-5px)'
          e.currentTarget.style.boxShadow = 'var(--sh3)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'var(--sh2)'
        }}
      >
        {/* Shine sweep on hover — via CSS animation in globals */}
        <div style={{ position:'relative', height:imgHeight, overflow:'hidden' }}>
          <img
            src={article.image_url || article.image}
            alt={article.title}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', filter:'brightness(.97) saturate(1.1)', transition:'transform .5s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          {/* Image dissolves into white */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 25%,rgba(255,255,255,.1) 55%,rgba(255,255,255,.92) 100%)' }} />
        </div>

        <div style={{ padding: big ? '22px 24px 24px' : '16px 18px 18px' }}>
          {/* Category chip */}
          <span className={`chip chip-${article.category}`} style={{ marginBottom:9 }}>
            {cat.emoji} {cat.label.toUpperCase()}
          </span>

          {/* Title */}
          <h2 style={{
            fontFamily: "'Cormorant',serif", fontWeight: 500, color: 'var(--ink)',
            lineHeight: 1.2, marginBottom: 8,
            fontSize: big ? 'clamp(18px,1.9vw,22px)' : 'clamp(13.5px,1.3vw,16px)',
          }}>
            {article.title}
          </h2>

          {/* Summary for big card */}
          {big && article.summary && (
            <p style={{ fontSize:13, color:'var(--ink5)', lineHeight:1.68, fontWeight:300, marginBottom:0 }}>
              {article.summary}
            </p>
          )}

          {/* Footer */}
          <div style={{ display:'flex', alignItems:'center', marginTop:14, paddingTop:12, borderTop:'1px solid rgba(12,26,58,.05)' }}>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink8)' }}>
              {timeAgo(article.published_at)}
            </span>
            {article.views > 0 && (
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink8)', marginLeft:'auto', marginRight:10 }}>
                👁 {fmtViews(article.views)}
              </span>
            )}
            <span style={{
              width:26, height:26, borderRadius:'50%', background:'var(--pearl)',
              border:'1px solid var(--lace)', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, color:'var(--ink4)', flexShrink:0, marginLeft:'auto', transition:'all .25s',
            }}>→</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// ── Compact article row (for article list) ─────────────────
export function ArticleRow({ article, lang = 'en' }) {
  const cat = CAT_META[article.category] || CAT_META.africa
  const href = `/article/${article.slug}?lang=${lang}`

  return (
    <Link href={href} style={{
      display:'flex', gap:16, padding:'16px 0',
      borderBottom:'1px solid rgba(12,26,58,.05)',
      textDecoration:'none', color:'inherit', transition:'all .2s',
      position:'relative',
    }}>
      <div style={{ width:86, height:63, borderRadius:10, overflow:'hidden', flexShrink:0, boxShadow:'var(--sh1)' }}>
        <img
          src={article.image_url || article.image}
          alt={article.title}
          style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(.97)' }}
        />
      </div>
      <div>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, fontWeight:700, letterSpacing:1.5, color:cat.color, textTransform:'uppercase', marginBottom:4 }}>
          {cat.emoji} {cat.label}
        </div>
        <div style={{ fontFamily:"'Cormorant',serif", fontSize:15, fontWeight:500, color:'var(--ink)', lineHeight:1.3, marginBottom:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {article.title}
        </div>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink8)' }}>
          {timeAgo(article.published_at)} · 👁 {fmtViews(article.views || 0)}
        </div>
      </div>
    </Link>
  )
}

// ── Skeleton card ──────────────────────────────────────────
export function SkeletonCard({ big = false }) {
  return (
    <div style={{ background:'var(--pure)', borderRadius:18, border:'1px solid rgba(12,26,58,.06)', boxShadow:'var(--sh1)', overflow:'hidden', gridRow: big ? 'span 2' : 'auto' }}>
      <div className="skel" style={{ height: big ? 320 : 170 }} />
      <div style={{ padding:'18px 20px 20px' }}>
        <div className="skel" style={{ height:20, width:'38%', marginBottom:10 }} />
        <div className="skel" style={{ height: big ? 24 : 18, marginBottom:8 }} />
        {big && <div className="skel" style={{ height:18, width:'75%', marginBottom:8 }} />}
        <div className="skel" style={{ height:14, width:'55%', marginTop:14 }} />
      </div>
    </div>
  )
}
