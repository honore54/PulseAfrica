'use client'
import { useEffect, useRef } from 'react'

// ── Professional Adsterra Ad Placements ──────────────────
// Positioned like BBC, CNN, Al Jazeera — natural and clean

export default function AdBanner({ size = 'rectangle', label = true }) {

  // 300x250 — Mid-article rectangle (highest paying)
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
          }}>
            Advertisement
          </p>
        )}
        <div style={{
          width: 300,
          height: 250,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid var(--lace)',
          background: 'var(--pearl)',
        }}>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var atOptions = {
                    'key': '88a98201e929bca18285796130de047d',
                    'format': 'iframe',
                    'height': 250,
                    'width': 300,
                    'params': {}
                  };
                  var d = document, s = d.createElement('script');
                  s.type = 'text/javascript';
                  s.async = true;
                  s.src = 'https://www.highperformanceformat.com/88a98201e929bca18285796130de047d/invoke.js';
                  d.head.appendChild(s);
                })();
              `
            }}
          />
        </div>
      </div>
    )
  }

  // Native Banner — blends naturally with content
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
          }}>
            Sponsored
          </p>
        )}
        <div id="container-6504f9b6647c3fbed07e1e8d57f0d892" />
      </div>
    )
  }

  // Mobile 320x50 — sticky bottom for mobile users
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var atOptions = {
                  'key': '5dab8a6165ad6f6c7573b276bf447626',
                  'format': 'iframe',
                  'height': 50,
                  'width': 320,
                  'params': {}
                };
                var d = document, s = d.createElement('script');
                s.type = 'text/javascript';
                s.async = true;
                s.src = 'https://www.highperformanceformat.com/5dab8a6165ad6f6c7573b276bf447626/invoke.js';
                d.head.appendChild(s);
              })();
            `
          }}
        />
      </div>
    )
  }

  return null
}
