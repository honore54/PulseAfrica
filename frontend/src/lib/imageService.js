const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY

export async function fetchSmartImage(query, category, title = '') {
  const searches = [
    query,
    `${category} africa professional`,
    category,
  ].filter(Boolean)

  if (UNSPLASH_KEY) {
    for (const q of searches) {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=10&orientation=landscape&content_filter=high`,
          { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` }, next: { revalidate: 3600 } }
        )
        if (!res.ok) continue
        const data   = await res.json()
        const photos = (data.results || []).filter(p => p.width >= 1000)
        if (photos.length > 0) {
          const photo = photos[Math.floor(Math.random() * Math.min(5, photos.length))]
          console.log(`[Image] Unsplash ✓ "${q}"`)
          return photo.urls.regular + '&w=1200&h=675&fit=crop&auto=format&q=90'
        }
      } catch (err) {
        console.warn(`[Image] Unsplash error: ${err.message}`)
      }
    }
  }

  const FALLBACKS = {
    politics:      ['1529107386315-e1a2ed48a620','1541872703-74c5e44368f9','1568024297703-cb5e44f87c7a'],
    sports:        ['1461896836934-ffe607ba8211','1508739773434-c26b3d09e071','1574629810360-7efbbe195018'],
    entertainment: ['1470225620780-dba8ba36b745','1493225457124-a3eb161ffa5f','1511671782779-c97d3d27a1d4'],
    africa:        ['1547471080-7cc2caa01a7e','1523805009345-7448845a9e53','1504711434969-e33886168f5c'],
    technology:    ['1518770660439-4636190af475','1461749280684-dccba630e2f6','1485827404703-89b55fcc595e'],
    business:      ['1579621970563-ebec7221a9a4','1454165804606-c3d57bc86b40','1611974789855-9c2a0a7236a3'],
  }
  const pool = FALLBACKS[category] || FALLBACKS.africa
  const id   = pool[Math.floor(Math.random() * pool.length)]
  return `https://images.unsplash.com/photo-${id}?w=1200&h=675&fit=crop&auto=format&q=90`
}
