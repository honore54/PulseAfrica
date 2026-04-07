import { getAuthorForCategory } from './authors.js'
import slugify from 'slugify'

const GROQ_KEY      = process.env.GROQ_API_KEY
const GNEWS_KEY     = process.env.GNEWS_API_KEY
const NEWSDATA_KEY  = process.env.NEWSDATA_API_KEY

export const CATEGORIES = [
  { id: 'politics',      label: 'Politics',      emoji: '🏛️', color: 'var(--ruby)',    light: 'var(--ruby5)'    },
  { id: 'sports',        label: 'Sports',        emoji: '⚽', color: 'var(--jade)',    light: 'var(--jade5)'    },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: 'var(--violet)',  light: 'var(--violet4)'  },
  { id: 'africa',        label: 'Africa',        emoji: '🌍', color: 'var(--copper2)', light: 'var(--copper5)'  },
  { id: 'technology',    label: 'Technology',    emoji: '💻', color: 'var(--sap)',     light: 'var(--sap5)'     },
  { id: 'business',      label: 'Business',      emoji: '📈', color: 'var(--amber)',   light: 'var(--amber6)'   },
]

const AFRICAN_COUNTRIES = [
  'Rwanda','Kenya','Ghana','Ethiopia','South Africa','Senegal','Tanzania',
  'Egypt','Morocco',"Côte d'Ivoire",'Uganda','Cameroon','Zimbabwe',
  'Mozambique','Angola','Zambia','Mali','DRC','Somalia','Tunisia',
  'Algeria','Botswana','Namibia','Madagascar','Togo',
]

function pickCountry() {
  return AFRICAN_COUNTRIES[Math.floor(Math.random() * AFRICAN_COUNTRIES.length)]
}

const IMAGE_POOLS = {
  politics:      ['1529107386315-e1a2ed48a620','1541872703-74c5e44368f9','1569025743873-ea3a9ade89f9','1521587760476-6c12a4b040da','1580489944761-15a19d654956'],
  sports:        ['1551698618-1dfe5d97d256','1508739773434-c26b3d09e071','1574629810360-7efbbe195018','1594737625785-a6cbdabd333c','1540747913346-19212a4b3993','1517649763962-0c623066013b','1571019614242-c5c5dee9f50b','1552674605-db5fecabfe68'],
  entertainment: ['1514320291841-3b2f730e0c84','1470225620780-dba8ba36b745','1524368535928-5b5e00ddc76b','1598387993441-a364f854c3e1','1429962714451-bb934ecdc4ec','1501612780327-45045538702b','1493225457124-a3eb161ffa5f','1511671782779-c97d3d27a1d4'],
  africa:        ['1509099836639-18ba1795216d','1523805009345-7448845a9e53','1547471080-7cc2caa01a7e','1569025690938-a00729c9e1f9','1504711434969-e33886168f5c'],
  technology:    ['1518770660439-4636190af475','1485827404703-89b55fcc595e','1461749280684-dccba630e2f6','1550751827-4bd374c3f58b','1526374965328-7f61d4dc18c5'],
  business:      ['1611974789855-9c2a0a7236a3','1579621970563-ebec7221a9a4','1454165804606-c3d57bc86b40','1486406146926-c627a92ad1ab','1560472354-b33ff0c44a43'],
}

export function getCategoryImage(category, index = null) {
  const pool = IMAGE_POOLS[category] || IMAGE_POOLS.africa
  const idx  = index !== null ? index % pool.length : Math.floor(Math.random() * pool.length)
  return `https://images.unsplash.com/photo-${pool[idx]}?w=1200&h=675&fit=crop&auto=format&q=85`
}

export async function fetchUnsplashImage(query, category) {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return getCategoryImage(category)
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' Africa')}&per_page=6&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${key}` }, next: { revalidate: 3600 } }
    )
    if (!res.ok) return getCategoryImage(category)
    const data   = await res.json()
    const photos = data.results || []
    if (!photos.length) return getCategoryImage(category)
    const photo = photos[Math.floor(Math.random() * Math.min(photos.length, 3))]
    return photo.urls.regular + '&w=1200&h=675&fit=crop'
  } catch {
    return getCategoryImage(category)
  }
}

const GNEWS_QUERIES = {
  politics: [
    'Africa election 2026','African Union summit','Africa government reform',
    'Africa president parliament','South Africa Nigeria politics',
    'Africa sanctions peace deal','African democracy','Africa foreign policy',
    'Africa security conflict','Africa regional summit',
  ],
  africa: [
    'Africa economy development','African Union policy','IMF World Bank Africa',
    'Africa infrastructure','Africa climate change','Africa food security',
    'Africa health news','Africa humanitarian','Africa renewable energy',
    'Africa debt economy',
  ],
  technology: [
    'Africa fintech startup','Africa technology innovation','Africa mobile internet',
    'Africa artificial intelligence','Africa tech hub','Africa digital payment',
    'Africa e-commerce','Africa cybersecurity','Nigeria Kenya tech',
    'Africa 5G connectivity',
  ],
  business: [
    'Africa investment trade','Africa economy GDP','Africa business market',
    'Africa stock exchange','Africa startup funding','Africa banking finance',
    'Africa AFCFTA trade','Africa mining resources','Africa agriculture export',
    'Africa oil price',
  ],
  sports: [
    'African football news','AFCON Africa Cup','CAF Champions League',
    'Africa World Cup 2026','Mohamed Salah','Victor Osimhen',
    'African Premier League','Africa athletics','Basketball Africa League',
    'Africa rugby sport',
  ],
  entertainment: [
    'Afrobeats music','African music award','Nollywood 2026',
    'Burna Boy','Wizkid music','Davido music',
    'Tems Afrobeats','Amapiano music','African Grammy',
    'African Netflix music',
  ],
}

const NEWSDATA_CATEGORY_MAP = {
  politics: 'politics', sports: 'sports', entertainment: 'entertainment',
  africa: 'world', technology: 'technology', business: 'business',
}

const NEWSDATA_COUNTRIES = {
  politics: 'ng,za,ke', sports: 'ng,za,ke', entertainment: 'ng,gh,za',
  africa: 'ng,ke,za',   technology: 'ng,ke,gh', business: 'ng,za,ke',
}

const IMAGE_QUERY_EXAMPLES = {
  politics:      'parliament government officials podium Africa',
  sports:        'football stadium crowd cheering Africa',
  entertainment: 'african music concert stage performance',
  africa:        'african city skyline landscape nature',
  technology:    'african tech startup office laptop',
  business:      'african business meeting office cityscape',
}

const _seenTitles = new Map()

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

function isDuplicate(title) {
  if (!title) return false
  const norm = normalizeTitle(title)
  const now  = Date.now()
  const TTL  = 24 * 60 * 60 * 1000
  for (const [k, ts] of _seenTitles) { if (now - ts > TTL) _seenTitles.delete(k) }
  if (_seenTitles.has(norm)) return true
  const wordsA = norm.split(' ').filter(w => w.length > 3)
  for (const [k] of _seenTitles) {
    const wordsB  = new Set(k.split(' ').filter(w => w.length > 3))
    const overlap = wordsA.filter(w => wordsB.has(w)).length
    const union   = new Set([...wordsA, ...wordsB]).size
    if (union > 0 && overlap / union > 0.70) return true
  }
  return false
}

function markSeen(title) {
  if (title) _seenTitles.set(normalizeTitle(title), Date.now())
}

function pickBest(articles) {
  if (!articles.length) return null
  const pool = articles.slice(0, Math.min(5, articles.length))
  return pool[Math.floor(Math.random() * pool.length)]
}

const delay = ms => new Promise(r => setTimeout(r, ms))

async function gnewsSearch(query, maxDays = 30) {
  const res = await fetch(
    `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&sortby=publishedAt&in=title,description&apikey=${GNEWS_KEY}`,
    { next: { revalidate: 900 } }
  )
  if (res.status === 429 || res.status === 403) throw new Error('GNEWS_QUOTA_EXCEEDED')
  if (!res.ok) throw new Error(`GNews HTTP ${res.status}`)
  const data = await res.json()
  return (data.articles || []).filter(a => {
    const age = (Date.now() - new Date(a.publishedAt).getTime()) / 86400000
    return age <= maxDays && !isDuplicate(a.title)
  })
}

function formatGnews(a) {
  return {
    title: a.title || '', description: a.description || '',
    content: a.content || a.description || '',
    source: a.source?.name || 'African News',
    url: a.url || '', publishedAt: a.publishedAt || new Date().toISOString(),
  }
}

async function newsdataSearch(query, category) {
  if (!NEWSDATA_KEY) throw new Error('NEWSDATA_KEY not set')
  const cat     = NEWSDATA_CATEGORY_MAP[category] || 'world'
  const country = NEWSDATA_COUNTRIES[category]    || 'ng,ke,za'
  const res = await fetch(
    `https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&q=${encodeURIComponent(query)}&language=en&category=${cat}&country=${country}`,
    { next: { revalidate: 900 } }
  )
  if (res.status === 429) throw new Error('NEWSDATA_RATE_LIMITED')
  if (!res.ok) throw new Error(`NewsData ${res.status}`)
  const data = await res.json()
  return (data.results || [])
    .filter(a => a.title && (a.description || a.content) && !isDuplicate(a.title))
    .map(a => ({
      title: a.title, description: a.description || '',
      content: a.content || a.description || '',
      source: a.source_id || 'African News',
      url: a.link || '', publishedAt: a.pubDate || new Date().toISOString(),
    }))
}

async function newsdataLatest(category) {
  if (!NEWSDATA_KEY) throw new Error('NEWSDATA_KEY not set')
  const cat     = NEWSDATA_CATEGORY_MAP[category] || 'world'
  const country = NEWSDATA_COUNTRIES[category]    || 'ng,ke,za'
  const res = await fetch(
    `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_KEY}&language=en&category=${cat}&country=${country}`,
    { next: { revalidate: 900 } }
  )
  if (res.status === 429) throw new Error('NEWSDATA_RATE_LIMITED')
  if (!res.ok) throw new Error(`NewsData latest ${res.status}`)
  const data = await res.json()
  return (data.results || [])
    .filter(a => a.title && !isDuplicate(a.title))
    .map(a => ({
      title: a.title, description: a.description || '',
      content: a.content || a.description || '',
      source: a.source_id || 'African News',
      url: a.link || '', publishedAt: a.pubDate || new Date().toISOString(),
    }))
}

export async function fetchRealArticle(category) {
  const pool = [...(GNEWS_QUERIES[category] || [])].sort(() => Math.random() - 0.5)

  if (GNEWS_KEY) {
    for (const query of pool.slice(0, 2)) {
      try {
        const articles = await gnewsSearch(query)
        const pick = pickBest(articles)
        if (pick) { console.log(`[GNews:${category}] ✓ "${pick.title}"`); return formatGnews(pick) }
      } catch (err) {
        if (err.message === 'GNEWS_QUOTA_EXCEEDED') break
        console.warn(`[GNews:${category}] ${err.message}`)
      }
    }
  }

  if (NEWSDATA_KEY) {
    for (const query of pool.slice(0, 3)) {
      try {
        const results = await newsdataSearch(query, category)
        const pick = pickBest(results)
        if (pick) { console.log(`[NewsData:${category}] ✓ "${pick.title}"`); return pick }
      } catch (err) {
        if (err.message === 'NEWSDATA_RATE_LIMITED') break
        console.warn(`[NewsData:${category}] ${err.message}`)
      }
    }
    try {
      const results = await newsdataLatest(category)
      const pick = pickBest(results)
      if (pick) { console.log(`[NewsData:${category}] ✓ Latest: "${pick.title}"`); return pick }
    } catch (err) {
      console.warn(`[NewsData:${category}] Latest: ${err.message}`)
    }
  }

  throw new Error(`All sources exhausted for "${category}"`)
}

function safeParseJSON(text) {
  let c = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const s = c.indexOf('{'), e = c.lastIndexOf('}')
  if (s === -1 || e === -1) throw new Error('No JSON object found')
  c = c.slice(s, e + 1)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    .replace(/"([^"]*?)"/g, m => m.replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t'))
  return JSON.parse(c)
}

// ════════════════════════════════════════════════════════════════
// PROMPT — SEO optimized, human voice, fits in 1800 tokens
// Key: shorter source input + compact JSON schema = no JSON failures
// ════════════════════════════════════════════════════════════════
function buildPrompt(category, realArticle) {
  const catLabel = CATEGORIES.find(c => c.id === category)?.label || category

  const voices = {
    politics:      'Al Jazeera Africa — authoritative, balanced, focused on citizen impact',
    sports:        'BBC Sport Africa — passionate, energetic, dramatic storytelling',
    entertainment: 'OkayAfrica — vibrant, culturally sharp, celebratory',
    africa:        'The Africa Report — thoughtful, pan-African, solution-aware',
    technology:    'TechCabal — optimistic, specific, insider knowledge',
    business:      'Bloomberg Africa — precise, data-driven, investor-aware',
  }

  return `You are a senior ${catLabel} journalist at PulseAfrica. Write a high-quality SEO news article.

SOURCE:
Title: ${realArticle.title}
Summary: ${realArticle.description}
Details: ${(realArticle.content || '').slice(0, 500)}
Source: ${realArticle.source}

VOICE: ${voices[category] || 'Professional African news journalism'}

ARTICLE STRUCTURE (follow exactly):
- Intro paragraph: 80 words, hook + primary keyword naturally included
- ## Background and Context: 120 words — why this matters, history
- ## Key Developments: 120 words — core facts, specific details
- ## Impact on Africa: 120 words — effect on ordinary Africans
- ## Analysis: 100 words — deeper insight and implications
- ## What Happens Next: 60 words — what to watch for
- ## People Also Ask: 3 questions readers search + 30-word answers each

WRITING RULES:
- Mix short sentences (under 8 words) with longer ones (20+ words)
- Use specific names, places, numbers — never vague
- Natural conversational phrases are fine: "But here is the thing"
- NEVER write: "In conclusion", "It is worth noting", "This development", "Delve into", "Furthermore", "Moreover", "Robust", "Shed light on"
- Total: 700-750 words English (enough for AdSense, fits in token limit)

Return ONLY this compact JSON (no extra spaces):
{"title_en":"keyword-first headline max 75 chars","title_fr":"titre français max 75 chars","title_rw":"umutwe kinyarwanda max 75 chars","summary_en":"2 hook sentences max 180 chars","summary_fr":"2 phrases accrocheuses max 180 chars","summary_rw":"interuro 2 max 180 inyuguti","content_en":"700-750 word article with ## headings and ## People Also Ask section","content_fr":"500-550 mots meme structure ##","content_rw":"350-400 amagambo inzira imwe na EN","tags":["keyword","country","topic","category","africa"],"read_time":4,"location":"City, Country","image_query":"5 word specific photo query","seo_title":"55-60 chars keyword first","seo_desc":"150-155 chars compelling with keyword"}`
}

// ════════════════════════════════════════════════════════════════
// GROQ — 1800 max_tokens = fits TPM limit with 6 categories
// 6 × 1800 = 10,800 tokens < 12,000 TPM limit ✅
// temperature 0.6 = natural writing, stable JSON output
// ════════════════════════════════════════════════════════════════
async function callGroq(prompt, retryCount = 0) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model:           'llama-3.3-70b-versatile',
      messages:        [{ role: 'user', content: prompt }],
      max_tokens:      1800,  // 6 × 1800 = 10,800 < 12,000 TPM ✅
      temperature:     0.6,   // Stable JSON + natural writing
      response_format: { type: 'json_object' },
    }),
  })

  const json = await res.json()

  if (res.status === 429 || json.error?.message?.includes('Rate limit')) {
    if (retryCount >= 1) throw new Error('Groq rate limit exceeded')
    // Wait EXACTLY what Groq says, not a fixed 35s
    const match  = json.error?.message?.match(/try again in ([\d.]+)s/)
    const waitMs = match ? Math.ceil(parseFloat(match[1]) * 1000) + 500 : 8000
    console.warn(`[Groq] Rate limited — waiting ${Math.ceil(waitMs/1000)}s`)
    await delay(waitMs)
    return callGroq(prompt, retryCount + 1)
  }

  if (json.error) throw new Error(`Groq: ${json.error.message}`)
  const text = json.choices?.[0]?.message?.content || ''
  if (!text) throw new Error('Groq empty response')
  return text
}

export async function generateArticle(category, maxRetries = 2) {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Engine] ${category.toUpperCase()} attempt ${attempt}`)
      const realArticle = await fetchRealArticle(category)
      const rawText     = await callGroq(buildPrompt(category, realArticle))
      const parsed      = safeParseJSON(rawText)

      for (const f of ['title_en','content_en','summary_en','title_fr','title_rw','seo_title','seo_desc']) {
        if (!parsed[f] || String(parsed[f]).length < 10) throw new Error(`Empty: ${f}`)
      }

      if (parsed.content_en.length < 1200) {
        throw new Error(`Too short: ${parsed.content_en.length} chars`)
      }

      if (isDuplicate(parsed.title_en)) throw new Error(`Duplicate: "${parsed.title_en.slice(0,50)}"`)
      markSeen(parsed.title_en)

      const imageUrl = await fetchUnsplashImage(
        parsed.image_query || IMAGE_QUERY_EXAMPLES[category], category
      )
      const slug = slugify(parsed.title_en, { lower: true, strict: true }).slice(0, 80)
        + '-' + Date.now().toString(36)

      console.log(`[Engine] ✓ ${category}: "${parsed.title_en.slice(0,60)}" (${parsed.content_en.length}c)`)

      return {
        slug, category,
        image_url:    imageUrl,
        published_at: new Date().toISOString(),
        views:        0,
        read_time:    parsed.read_time || 4,
        location:     parsed.location  || 'Africa',
        tags:         Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
        seo_title:    parsed.seo_title,
        seo_desc:     parsed.seo_desc,
        source_url:   realArticle.url    || '',
        source_name:  realArticle.source || '',
        title_en:   parsed.title_en,   title_fr:   parsed.title_fr,   title_rw:   parsed.title_rw,
        summary_en: parsed.summary_en, summary_fr: parsed.summary_fr, summary_rw: parsed.summary_rw,
        content_en: parsed.content_en, content_fr: parsed.content_fr, content_rw: parsed.content_rw,
        author_id:  getAuthorForCategory(category).id,
      }

    } catch (err) {
      lastError = err
      console.warn(`[Engine] ✗ ${category} attempt ${attempt}: ${err.message}`)
      if (attempt < maxRetries) await delay(3000)
    }
  }

  throw new Error(`${category} failed — ${lastError?.message}`)
}

export async function generateAllCategories() {
  console.log(`[Engine] SESSION ${new Date().toISOString()}`)
  const results = [], failures = []

  for (const cat of CATEGORIES) {
    try {
      results.push(await generateArticle(cat.id, 2))
    } catch (err) {
      console.error(`[Engine] FAIL ${cat.id}: ${err.message}`)
      failures.push({ category: cat.id, error: err.message })
    }
    // 5s gap between categories = TPM bucket refills between calls
    await delay(5000)
  }

  console.log(`[Engine] ${results.length}/6 articles, ${failures.length} failed`)
  if (failures.length) failures.forEach(f => console.error(`  • ${f.category}: ${f.error}`))
  if (results.length === 0) throw new Error('Zero articles — check API keys')
  return results
}
