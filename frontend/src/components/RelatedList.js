"use client"
import React from 'react'

export default function RelatedList({ related = [], lang = 'en' }) {
  return (
    <div style={{ background:'var(--pure)', borderRadius:16, border:'1px solid rgba(12,26,58,.06)', boxShadow:'var(--sh2)', overflow:'hidden' }}>
      <div style={{ padding:'14px 18px 12px', borderBottom:'1px solid rgba(12,26,58,.05)' }}>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:3, color:'var(--ink7)', textTransform:'uppercase' }}>Related Articles</span>
      </div>
      {related.map(a => {
        const rc = (a.category && {
          politics:      { color:'var(--ruby)', emoji:'🏛️', label:'Politics' },
          sports:        { color:'var(--jade)', emoji:'⚽', label:'Sports' },
          entertainment: { color:'var(--violet)', emoji:'🎬', label:'Entertainment' },
          africa:        { color:'var(--copper2)', emoji:'🌍', label:'Africa' },
          technology:    { color:'var(--sap)', emoji:'💻', label:'Technology' },
          business:      { color:'var(--amber)', emoji:'📈', label:'Business' },
        }[a.category]) || { color:'var(--ink5)', emoji:'🌍', label:'News' }

        return (
          <a key={a.id} href={`/article/${a.slug}?lang=${lang}`} style={{ display:'flex', gap:12, padding:'12px 16px', borderBottom:'1px solid rgba(12,26,58,.04)', textDecoration:'none', transition:'background .2s' }}
            onMouseEnter={e => e.currentTarget.style.background='var(--mist)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <div style={{ width:72, height:52, borderRadius:8, overflow:'hidden', flexShrink:0 }}>
              <img src={a.image_url} alt={a.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
            <div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:8, fontWeight:700, color:rc.color, letterSpacing:1.5, marginBottom:3 }}>{rc.emoji} {rc.label}</div>
              <div style={{ fontFamily:"'Cormorant',serif", fontSize:13, fontWeight:500, color:'var(--ink2)', lineHeight:1.3 }}>{a.title}</div>
            </div>
          </a>
        )
      })}
    </div>
  )
}
