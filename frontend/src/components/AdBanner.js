'use client'
import { useEffect, useRef } from 'react'

function AdUnit({ adKey, width, height }) {
  const ref = useRef(null)
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !ref.current) return
    loaded.current = true

    // Set options then load script
    window.atOptions = {
      'key': adKey,
      'format': 'iframe',
      'height': height,
      'width': width,
      'params': {}
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`
    ref.current.appendChild(script)
  }, [adKey, width, height])

  return <div ref={ref} style={{ width, height, maxWidth: '100%' }} />
}

export default function AdBanner({ size = 'rectangle', label = true }) {

  // ── Leaderboard 728x90 — homepage & category pages ──────
  if (size === 'leaderboard') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '32px auto',
        maxWidth: '100%',
      }}>
        {label && (
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 8,
            color: 'var(--ink8)',
            letterSpacing: 2,
            marginBottom: 6,
            textTransform: 'uppercase',
          }}>Advertisement</p>
        )}
        <div style={{
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid var(--lace)',
          background: 'var(--pearl)',
          maxWidth: '100%',
        }}>
          <AdUnit
            adKey="88a98201e929bca18285796130de047d"
            width={728}
            height={90}
          />
        </div>
      </div>
    )
  }

  // ── Rectangle 300x250 — sidebar & article ────────────────
  if (size === 'rectangle') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '32px auto',
        maxWidth: 300,
      }}>
        {label && (
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 8,
            color: 'var(--ink8)',
            letterSpacing: 2,
            marginBottom: 6,
            textTransform: 'uppercase',
          }}>Advertisement</p>
        )}
        <div style={{
          width: 300,
          height: 250,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid var(--lace)',
          background: 'var(--pearl)',
        }}>
          <AdUnit
            adKey="88a98201e929bca18285796130de047d"
            width={300}
            height={250}
          />
        </div>
      </div>
    )
  }

  // ── Native Banner — blends with content ──────────────────
  if (size === 'native') {
    return (
      <div style={{
        margin: '32px auto',
        maxWidth: 780,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--lace)',
        background: 'var(--pearl)',
        padding: '4px',
      }}>
        {label && (
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 8,
            color: 'var(--ink8)',
            letterSpacing: 2,
            textAlign: 'center',
            marginBottom: 4,
            textTransform: 'uppercase',
          }}>Sponsored</p>
        )}
        <div id="container-6504f9b6647c3fbed07e1e8d57f0d892" />
      </div>
    )
  }

  // ── Mobile 320x50 sticky bottom ──────────────────────────
  if (size === 'mobile') {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 320,
        height: 50,
        zIndex: 998,
        borderTop: '1px solid var(--lace)',
        background: 'var(--pure)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <AdUnit
          adKey="5dab8a6165ad6f6c7573b276bf447626"
          width={320}
          height={50}
        />
      </div>
    )
  }

  return null
}
