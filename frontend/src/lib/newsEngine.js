import slugify from 'slugify'

const GROQ_KEY = process.env.GROQ_API_KEY

// ── Category config ───────────────────────────────────────
export const CATEGORIES = [
  { id: 'politics',      label: 'Politics',      emoji: '🏛️', color: 'var(--ruby)',    light: 'var(--ruby5)'    },
  { id: 'sports',        label: 'Sports',        emoji: '⚽', color: 'var(--jade)',    light: 'var(--jade5)'    },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: 'var(--violet)',  light: 'var(--violet4)'  },
  { id: 'africa',        label: 'Africa',        emoji: '🌍', color: 'var(--copper2)', light: 'var(--copper5)'  },
  { id: 'technology',    label: 'Technology',    emoji: '💻', color: 'var(--sap)',     light: 'var(--sap5)'     },
  { id: 'business',      label: 'Business',      emoji: '📈', color: 'var(--amber)',   light: 'var(--amber6)'   },
]

// ── Country rotation pool ─────────────────────────────────
const AFRICAN_COUNTRIES = [
  'Rwanda', 'Kenya', 'Ghana', 'Ethiopia', 'South Africa',
  'Senegal', 'Tanzania', 'Egypt', 'Morocco', 'Côte d\'Ivoire',
  'Uganda', 'Cameroon', 'Zimbabwe', 'Mozambique', 'Angola',
  'Zambia', 'Mali', 'Burkina Faso', 'Niger', 'Chad',
  'DRC', 'Somalia', 'Sudan', 'Tunisia', 'Algeria',
  'Botswana', 'Namibia', 'Madagascar', 'Malawi', 'Togo',
]

function pickCountry() {
  return AFRICAN_COUNTRIES[Math.floor(Math.random() * AFRICAN_COUNTRIES.length)]
}

// ── Curated Unsplash image pools per category ─────────────
const IMAGE_POOLS = {
  politics: [
    '1569025743873-ea3a9ade89f9',
    '1529107386315-e1a2ed48a620',
    '1541872703-74c5e44368f9',
    '1521587760476-6c12a4b040da',
    '1535378917042-10a22c5f3a85',
    '1580489944761-15a19d654956',
    '1589391886645-d51941baf7fb',
    '1507003211169-0a1dd7228f2d',
  ],
  sports: [
    '1551698618-1dfe5d97d256',
    '1508739773434-c26b3d09e071',
    '1540747913346-19212a4b3993',
    '1594737625785-a6cbdabd333c',
    '1574629810360-7efbbe195018',
    '1554068865-24cecd4e34b8',
    '1516450360452-9312f5e86fc7',
    '1558985250-27a406d64cb3',
  ],
  entertainment: [
    '1493225457124-a3eb161ffa5f',
    '1511671782779-c97d3d27a1d4',
    '1483695028939-5bb13f8648b0',
    '1459749411175-04bf5292ceea',
    '1516450360452-9312f5e86fc7',
    '1470225620780-dba8ba36b745',
    '1571019613454-1cb2f99b2d8b',
    '1540575467063-ba5571d648c2',
  ],
  africa: [
    '1509099836639-18ba1795216d',
    '1489392191049-fc10c97e64b9',
    '1523805009345-7448845a9e53',
    '1547471080-7cc2caa01a7e',
    '1569025690938-a00729c9e1f9',
    '1504711434969-e33886168f5c',
    '1506905925346-21bda4d32df4',
    '1547036967-23d11aacaee0',
  ],
  technology: [
    '1518770660439-4636190af475',
    '1639762681485-074b7f938ba0',
    '1485827404703-89b55fcc595e',
    '1461749280684-dccba630e2f6',
    '1550751827-4bd374c3f58b',
    '1526374965328-7f61d4dc18c5',
    '1451187580459-43490279c0fa',
    '1496171367470-9ed9a91ea931',
  ],
  business: [
    '1611974789855-9c2a0a7236a3',
    '1579621970563-ebec7221a9a4',
    '1454165804606-c3d57bc86b40',
    '1486406146926-c627a92ad1ab',
    '1507003211169-0a1dd7228f2d',
    '1560472354-b33ff0c44a43',
    '1556742049-0cfed4f6a45d',
    '1444653614773-995cb1ef9ffe',
  ],
}

// ── Get a curated image URL ───────────────────────────────
export function getCategoryImage(category, index = null) {
  const pool = IMAGE_POOLS[category] || IMAGE_POOLS.africa
  const idx = index !== null
    ? index % pool.length
    : Math.floor(Math.random() * pool.length)
  return `https://images.unsplash.com/photo-${pool[idx]}?w=1200&h=675&fit=crop&auto=format&q=85`
}

// ── Fetch a fresh Unsplash image via API ──────────────────
export async function fetchUnsplashImage(query, category) {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return getCategoryImage(category)

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' Africa')}&per_page=6&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${key}` },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return getCategoryImage(category)
    const data = await res.json()
    const photos = data.results || []
    if (photos.length === 0) return getCategoryImage(category)
    const photo = photos[Math.floor(Math.random() * Math.min(photos.length, 3))]
    return photo.urls.regular + '&w=1200&h=675&fit=crop'
  } catch {
    return getCategoryImage(category)
  }
}

// ── Fetch trending headlines via NewsAPI ──────────────────
async function fetchTrendingTopics(category) {
  const key = process.env.NEWS_API_KEY
  if (!key) return null

  const queries = {
    politics:      'Africa politics government elections',
    sports:        'Africa sports football athletics',
    entertainment: 'Africa music entertainment Afrobeats',
    africa:        'Africa economy development infrastructure',
    technology:    'Africa technology startup fintech innovation',
    business:      'Africa business investment trade economy',
  }

  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(queries[category] || 'Africa')}&language=en&sortBy=publishedAt&pageSize=5`,
      { headers: { 'X-Api-Key': key } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const headlines = (data.articles || [])
      .slice(0, 5)
      .map(a => `• ${a.title}`)
      .join('\n')
    return headlines || null
  } catch {
    return null
  }
}

// ── Safe JSON parser ──────────────────────────────────────
function safeParseJSON(text) {
  // Remove markdown fences
  let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

  // Find first { and last } to extract pure JSON
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found in response')
  clean = clean.slice(start, end + 1)

  // Remove control characters
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')

  // Fix unescaped newlines inside strings
  clean = clean.replace(/"([^"]*?)"/g, (match) => {
    return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
  })

  return JSON.parse(clean)
}

// ── Core: Generate one full article with AI ───────────────
export async function generateArticle(category) {
  const catMeta = CATEGORIES.find(c => c.id === category) || CATEGORIES[0]
  const headlines = await fetchTrendingTopics(category)
  const country = pickCountry()
  const country2 = pickCountry()

  const headlineCtx = headlines
    ? `\n\nRecent real headlines for context (use as inspiration only, do NOT copy):\n${headlines}`
    : ''

  const prompt = `You are PulseAfrica, Africa's premier AI-powered news publication. Generate a compelling, realistic news article for the "${catMeta.label}" category focused on ${country} (or mention ${country2} as a secondary country).
${headlineCtx}

STRICT RULES:
1. The article MUST be about ${country} — not Nigeria
2. Include specific names of real-sounding officials, concrete statistics, expert quotes
3. Strong African perspective throughout
4. Each language version must feel native, NOT like a translation
5. Return ONLY valid JSON — no markdown, no text outside JSON, no newlines inside string values

Return this exact JSON structure:
{"title_en":"English headline max 80 chars","title_fr":"Titre français max 80 chars","title_rw":"Umutwe Kinyarwanda max 80 chars","summary_en":"2-sentence English summary max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"Full English article 300-400 words. Use ## for 2-3 headings. Include one direct quote. End with forward-looking paragraph.","content_fr":"Article français 250-300 mots. Utilise ## pour sous-titres.","content_rw":"Ingingo Kinyarwanda 200-250 amagambo. Koresha ## kubara interuro.","tags":["tag1","tag2","tag3","tag4","tag5"],"read_time":4,"location":"City, ${country}","image_query":"3-word landscape query for Unsplash","seo_title":"60-char SEO title","seo_desc":"150-char meta description"}`

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2500,
      temperature: 0.9,
      response_format: { type: 'json_object' }
    })
  })

  const json = await res.json()
  console.log('[GROQ] Raw response:', JSON.stringify(json).slice(0, 300))
  if (json.error) throw new Error(`Groq error: ${json.error.message}`)
  const text = json.choices?.[0]?.message?.content || ''
  if (!text) throw new Error('Groq returned empty text')

  const parsed = safeParseJSON(text)

  const imageUrl = await fetchUnsplashImage(parsed.image_query || category, category)

  const slug = slugify(parsed.title_en || category, { lower: true, strict: true }).slice(0, 80)
    + '-' + Date.now().toString(36)

  return {
    slug,
    category,
    image_url: imageUrl,
    published_at: new Date().toISOString(),
    views: 0,
    read_time: parsed.read_time || 4,
    location: parsed.location || `${country}`,
    tags: parsed.tags || [],
    seo_title: parsed.seo_title || parsed.title_en,
    seo_desc:  parsed.seo_desc  || parsed.summary_en,
    title_en:   parsed.title_en   || '',
    title_fr:   parsed.title_fr   || '',
    title_rw:   parsed.title_rw   || '',
    summary_en: parsed.summary_en || '',
    summary_fr: parsed.summary_fr || '',
    summary_rw: parsed.summary_rw || '',
    content_en: parsed.content_en || '',
    content_fr: parsed.content_fr || '',
    content_rw: parsed.content_rw || '',
  }
}

// ── Generate one article per category (6 total per cycle) ─
export async function generateAllCategories() {
  const results = []
  for (const cat of CATEGORIES) {
    try {
      console.log(`[AI] Generating ${cat.label} article...`)
      const article = await generateArticle(cat.id)
      results.push(article)
      console.log(`[AI] ✓ ${cat.label}: "${(article.title_en || '').slice(0, 60)}..."`)
      await new Promise(r => setTimeout(r, 600))
    } catch (err) {
      console.error(`[AI] ✗ Failed ${cat.id}:`, err.message)
    }
  }
  return results
}