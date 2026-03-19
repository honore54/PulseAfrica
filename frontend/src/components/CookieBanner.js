'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookie_consent')
    if (!accepted) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'true')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'false')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:9999,
      background:'var(--pure)', borderTop:'1px solid var(--lace)',
      boxShadow:'0 -4px 24px rgba(12,26,58,.08)',
      padding:'20px 40px', display:'flex', alignItems:'center',
      justifyContent:'space-between', flexWrap:'wrap', gap:16,
    }}>
      <div style={{ flex:1, minWidth:280 }}>
        <p style={{ fontFamily:"'Cormorant',serif", fontSize:18, fontWeight:500, color:'var(--ink)', margin:'0 0 4px' }}>
          We use cookies
        </p>
        <p style={{ fontSize:13, color:'var(--ink5)', margin:0, lineHeight:1.6 }}>
          PulseAfrica uses cookies to improve your experience and serve relevant ads.
          By continuing to use our site you accept our{' '}
          <a href="/privacy" style={{ color:'var(--sap)', textDecoration:'none' }}>Privacy Policy</a>
          {' '}and{' '}
          <a href="/terms" style={{ color:'var(--sap)', textDecoration:'none' }}>Terms of Service</a>.
        </p>
      </div>
      <div style={{ display:'flex', gap:10, flexShrink:0 }}>
        <button onClick={decline} style={{
          padding:'10px 20px', borderRadius:100,
          border:'1px solid var(--lace)', background:'transparent',
          fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink6)',
          cursor:'pointer', letterSpacing:1,
        }}>
          DECLINE
        </button>
        <button onClick={accept} style={{
          padding:'10px 24px', borderRadius:100,
          border:'none', background:'var(--ink)',
          fontFamily:"'Space Mono',monospace", fontSize:9, color:'#fff',
          cursor:'pointer', letterSpacing:1,
        }}>
          ACCEPT ALL
        </button>
      </div>
    </div>
  )
}
