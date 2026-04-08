'use client'
import { useEffect, useRef, useState } from 'react'

function AdContainer({ adKey, width, height }) {
  const ref  = useRef(null)
  const done = useRef(false)
  useEffect(() => {
    if (done.current || !ref.current) return
    done.current = true
    ref.current.innerHTML = ''
    const opt = document.createElement('script')
    opt.type = 'text/javascript'
    opt.textContent = `window.atOptions={'key':'${adKey}','format':'iframe','height':${height},'width':${width},'params':{}};`
    ref.current.appendChild(opt)
    const inv = document.createElement('script')
    inv.type = 'text/javascript'
    inv.async = true
    inv.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`
    ref.current.appendChild(inv)
  }, [])
  return <div ref={ref} style={{ width, height, maxWidth:'100%', overflow:'hidden' }} />
}

export default function AdBanner({ size='rectangle', label=true }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  if (size === 'leaderboard') return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', margin:'32px auto', maxWidth:'100%' }}>
      {label && <p style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink8)', letterSpacing:2, marginBottom:6, textTransform:'uppercase' }}>Advertisement</p>}
      <div style={{ borderRadius:8, overflow:'hidden', border:'1px solid var(--lace)', maxWidth:'100%' }}>
        <AdContainer adKey="88a98201e929bca18285796130de047d" width={728} height={90} />
      </div>
    </div>
  )

  if (size === 'rectangle') return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', margin:'32px auto', maxWidth:300 }}>
      {label && <p style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink8)', letterSpacing:2, marginBottom:6, textTransform:'uppercase' }}>Advertisement</p>}
      <div style={{ width:300, height:250, borderRadius:8, overflow:'hidden', border:'1px solid var(--lace)' }}>
        <AdContainer adKey="88a98201e929bca18285796130de047d" width={300} height={250} />
      </div>
    </div>
  )

  if (size === 'native') return (
    <div style={{ margin:'32px auto', maxWidth:780, borderRadius:12, overflow:'hidden', border:'1px solid var(--lace)', background:'var(--pearl)', padding:'4px' }}>
      {label && <p style={{ fontFamily:"'Space Mono',monospace", fontSize:8, color:'var(--ink8)', letterSpacing:2, textAlign:'center', marginBottom:4, textTransform:'uppercase' }}>Sponsored</p>}
      <div id="container-6504f9b6647c3fbed07e1e8d57f0d892" />
    </div>
  )

  if (size === 'mobile') return (
    <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:320, height:50, zIndex:998, borderTop:'1px solid var(--lace)', background:'var(--pure)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <AdContainer adKey="5dab8a6165ad6f6c7573b276bf447626" width={320} height={50} />
    </div>
  )

  return null
}
