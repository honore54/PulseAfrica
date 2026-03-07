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
    '1529107386315-e1a2ed48a620',
    '1541872703-74c5e44368f9',
    '1569025743873-ea3a9ade89f9',
    '1521587760476-6c12a4b040da',
    '1580489944761-15a19d654956',
    '1555848962-6e79583f2078',
    '1575320181282-9afab399eb88',
    '1541417904950-b855846fe074',
  ],
  sports: [
    '1551698618-1dfe5d97d256',
    '1508739773434-c26b3d09e071',
    '1574629810360-7efbbe195018',
    '1594737625785-a6cbdabd333c',
    '1540747913346-19212a4b3993',
    '1517649763962-0c623066013b',
    '1571019614242-c5c5dee9f50b',
    '1552674605-db5fecabfe68',
  ],
  entertainment: [
    '1514320291841-3b2f730e0c84',
    '1470225620780-dba8ba36b745',
    '1524368535928-5b5e00ddc76b',
    '1598387993441-a364f854c3e1',
    '1429962714451-bb934ecdc4ec',
    '1501612780327-45045538702b',
    '1493225457124-a3eb161ffa5f',
    '1511671782779-c97d3d27a1d4',
  ],
  africa: [
    '1509099836639-18ba1795216d',
    '1523805009345-7448845a9e53',
    '1547471080-7cc2caa01a7e',
    '1569025690938-a00729c9e1f9',
    '1504711434969-e33886168f5c',
    '1506905925346-21bda4d32df4',
    '1547036967-23d11aacaee0',
    '1489392191049-fc10c97e64b9',
  ],
  technology: [
    '1518770660439-4636190af475',
    '1485827404703-89b55fcc595e',
    '1461749280684-dccba630e2f6',
    '1550751827-4bd374c3f58b',
    '1526374965328-7f61d4dc18c5',
    '1451187580459-43490279c0fa',
    '1496171367470-9ed9a91ea931',
    '1639762681485-074b7f938ba0',
  ],
  business: [
    '1611974789855-9c2a0a7236a3',
    '1579621970563-ebec7221a9a4',
    '1454165804606-c3d57bc86b40',
    '1486406146926-c627a92ad1ab',
    '1560472354-b33ff0c44a43',
    '1556742049-0cfed4f6a45d',
    '1444653614773-995cb1ef9ffe',
    '1507003211169-0a1dd7228f2d',
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

// ── Get yesterday's date for NewsAPI ─────────────────────
function getYesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

// ── Fetch latest breaking news via NewsAPI ────────────────
async function fetchTrendingTopics(category, country) {
  const key = process.env.NEWS_API_KEY
  if (!key) return null

  const queries = {
    politics:      `${country} OR Africa politics government election president minister`,
    sports:        `${country} OR Africa football soccer athletics sports championship`,
    entertainment: `${country} OR Africa music Afrobeats film celebrity entertainment`,
    africa:        `${country} OR Africa development economy infrastructure society`,
    technology:    `${country} OR Africa technology startup fintech mobile innovation`,
    business:      `${country} OR Africa business investment trade market economy`,
  }

  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(queries[category] || 'Africa')}&language=en&sortBy=publishedAt&pageSize=8&from=${getYesterday()}`,
      { headers: { 'X-Api-Key': key } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const articles = (data.articles || []).slice(0, 5)
    if (articles.length === 0) return null

    const headlines = articles
      .map(a => `• ${a.title} — ${a.description || ''}`.slice(0, 150))
      .join('\n')
    return headlines || null
  } catch {
    return null
  }
}

// ── Safe JSON parser ──────────────────────────────────────
function safeParseJSON(text) {
  let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found in response')
  clean = clean.slice(start, end + 1)
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
  clean = clean.replace(/"([^"]*?)"/g, (match) => {
    return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
  })
  return JSON.parse(clean)
}

// ── Image query examples per category ────────────────────
const IMAGE_QUERY_EXAMPLES = {
  politics:      'parliament building government officials podium',
  sports:        'football stadium crowd cheering athletes',
  entertainment: 'african music concert stage performance',
  africa:        'african city skyline landscape nature',
  technology:    'african tech startup office laptop coding',
  business:      'african business meeting office cityscape',
}

// ── Core: Generate one full article with AI ───────────────
export async function generateArticle(category) {
  const catMeta = CATEGORIES.find(c => c.id === category) || CATEGORIES[0]
  const country = pickCountry()
  const country2 = pickCountry()
  const headlines = await fetchTrendingTopics(category, country)

  const headlineCtx = headlines
    ? `\n\nBREAKING — Latest real news from the past 24 hours (use these as the BASIS for your article, expand with details, quotes and analysis — do NOT copy verbatim):\n${headlines}`
    : ''

  const prompt = `You are PulseAfrica, Africa's premier AI-powered news publication. Generate a compelling, realistic news article for the "${catMeta.label}" category focused on ${country} (or mention ${country2} as a secondary country).
${headlineCtx}

STRICT RULES:
1. The article MUST be about ${country} — not Nigeria
2. Base your article on the latest breaking news provided above if available
3. Include specific names of real-sounding officials, concrete statistics, expert quotes
4. Strong African perspective throughout
5. Each language version must feel native, NOT like a translation
6. Return ONLY valid JSON — no markdown, no text outside JSON, no newlines inside string values
7. For image_query: write a SPECIFIC 4-5 word Unsplash search query that EXACTLY matches the article topic. Example for ${category}: "${IMAGE_QUERY_EXAMPLES[category] || 'african landscape city people'}". It must match the article content — NOT generic food or random objects.

Return this exact JSON structure:
{"title_en":"English headline max 80 chars","title_fr":"Titre français max 80 chars","title_rw":"Umutwe Kinyarwanda max 80 chars","summary_en":"2-sentence English summary max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"Full English article 300-400 words. Use ## for 2-3 headings. Include one direct quote. End with forward-looking paragraph.","content_fr":"Article français 250-300 mots. Utilise ## pour sous-titres.","content_rw":"Ingingo Kinyarwanda 200-250 amagambo. Koresha ## kubara interuro.","tags":["tag1","tag2","tag3","tag4","tag5"],"read_time":4,"location":"City, ${country}","image_query":"specific 4-5 word query matching article topic e.g. african music concert stage","seo_title":"60-char SEO title","seo_desc":"150-char meta description"}`

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

  const imageUrl = await fetchUnsplashImage(parsed.image_query || IMAGE_QUERY_EXAMPLES[category] || category, category)

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