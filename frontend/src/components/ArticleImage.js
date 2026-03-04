'use client'

export default function ArticleImage({ src, alt, category }) {
  const fallbacks = {
    politics:      'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=675&fit=crop',
    sports:        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=675&fit=crop',
    entertainment: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=675&fit=crop',
    africa:        'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1200&h=675&fit=crop',
    technology:    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=675&fit=crop',
    business:      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=675&fit=crop',
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{ width:'100%', height:420, objectFit:'cover', display:'block' }}
      onError={(e) => {
        e.target.src = fallbacks[category] || fallbacks.africa
        e.target.onerror = null
      }}
    />
  )
}