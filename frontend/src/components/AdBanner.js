'use client'

export default function AdBanner({ size = 'leaderboard', className = '' }) {
  const sizes = {
    leaderboard: { width: '100%', height: 90, label: '728×90 Leaderboard' },
    rectangle:   { width: '100%', height: 250, label: '300×250 Rectangle' },
    banner:      { width: '100%', height: 60,  label: '468×60 Banner' },
  }
  const s = sizes[size] || sizes.leaderboard

  return (
    <div style={{
      width: s.width, height: s.height,
      borderRadius: 12, background: 'var(--mist)',
      border: '1.5px dashed var(--silk)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 5,
    }}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--ink8)', letterSpacing:2 }}>ADVERTISEMENT</div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:'var(--lace)' }}>{s.label} · Google AdSense</div>

      {/* Replace these divs with real AdSense code after approval:
      <ins className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="XXXXXXXXXX"
        data-ad-format="auto"
        data-full-width-responsive="true">
      </ins>
      */}
    </div>
  )
}
