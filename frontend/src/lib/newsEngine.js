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
  let gnewsDead = false

  if (GNEWS_KEY) {
    for (const query of pool.slice(0, 2)) {
      try {
        const articles = await gnewsSearch(query)
        const pick = pickBest(articles)
        if (pick) { console.log(`[GNews:${category}] ✓ "${pick.title}"`); return formatGnews(pick) }
      } catch (err) {
        if (err.message === 'GNEWS_QUOTA_EXCEEDED') { gnewsDead = true; break }
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
// PROMPT — 1000+ words, full SEO, People Also Ask, human voice
// Cron safe: uses max_tokens 2800, temperature 0.65
// ════════════════════════════════════════════════════════════════
function buildPrompt(category, realArticle) {
  const catLabel = CATEGORIES.find(c => c.id === category)?.label || category

  return `You are a senior ${catLabel} journalist at PulseAfrica — Africa's independent trilingual news platform. You have 15 years of experience writing for international African audiences.

SOURCE EVENT:
Headline: ${realArticle.title}
Summary: ${realArticle.description}
Details: ${(realArticle.content || '').slice(0, 700)}
Source: ${realArticle.source} — ${realArticle.publishedAt}

ARTICLE STRUCTURE REQUIRED:
Your article must follow this exact structure for maximum Google SEO ranking:

1. TITLE — keyword-focused, active verb, max 80 chars
2. INTRODUCTION (150 words) — open with a scene or striking fact, include primary keyword naturally in first 100 words, hook the reader immediately
3. ## Background and Context (200 words) — why this story matters, historical context, what led to this moment
4. ## Key Developments (200 words) — the core facts of what happened, specific details and numbers
5. ## Impact on Africa (200 words) — what this means for ordinary Africans, regional implications, who benefits or suffers
6. ## Expert Perspective and Analysis (150 words) — deeper analytical insight, what experts and observers are saying
7. ## What Happens Next (100 words) — what to watch for, timeline, future implications
8. ## People Also Ask — 3 questions people search about this topic, each with a 40-word direct answer

WRITING RULES — follow every single one:
- Mix SHORT sentences (under 10 words) with LONG ones (25+ words) — vary constantly
- Never start 3 consecutive sentences with the same word
- Use specific names, places, numbers — never vague generalities
- Write conversationally — "But here is what matters most" is fine
- Show genuine knowledge of Africa — add context a foreign journalist would miss
- NEVER use: "In conclusion", "It is worth noting", "This development", "Delve into", "Navigate", "Shed light on", "Robust", "Furthermore", "Moreover"
- End every section with a sentence that makes the reader want to read the next section
- Total length: 1000-1100 words in English

MULTILINGUAL RULES:
- French: Write as a French journalist — analytical, formal but engaging, not a translation
- Kinyarwanda: Write for East African readers — connect to regional context

Return ONLY valid JSON:
{
  "title_en": "Active keyword headline max 80 chars",
  "title_fr": "Titre actif max 80 chars — style journal français",
  "title_rw": "Umutwe ukurura max 80 chars — Kinyarwanda nyakuri",
  "summary_en": "2 sentences that stop a reader scrolling — 150-200 chars",
  "summary_fr": "2 phrases accrocheuses — 150-200 caractères",
  "summary_rw": "Interuro 2 zikurura — 150-200 inyuguti",
  "content_en": "1000-1100 words. Intro + ## Background and Context + ## Key Developments + ## Impact on Africa + ## Expert Perspective and Analysis + ## What Happens Next + ## People Also Ask (3 Q&As)",
  "content_fr": "700-800 mots. Même structure ## que EN. Style journalistique français.",
  "content_rw": "500-600 amagambo. Inzira imwe na EN. Kinyarwanda nyakuri.",
  "tags": ["primary_keyword", "country", "specific_topic", "category_tag", "africa"],
  "read_time": 5,
  "location": "Specific City, Country",
  "image_query": "5 specific words describing ideal photo for this story",
  "seo_title": "55-60 chars — primary keyword first",
  "seo_desc": "150-155 chars — specific, compelling, keyword included"
}`
}

// ════════════════════════════════════════════════════════════════
// GROQ — optimized for quality + cron safety
// max_tokens: 2800 (enough for 1000 words without burning TPM)
// temperature: 0.65 (natural writing, not robotic, not random)
// ════════════════════════════════════════════════════════════════
async function callGroq(prompt, retryCount = 0) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model:           'llama-3.3-70b-versatile',
      messages:        [{ role: 'user', content: prompt }],
      max_tokens:      2800,
      temperature:     0.65,
      response_format: { type: 'json_object' },
    }),
  })

  const json = await res.json()

  if (res.status === 429 || json.error?.message?.includes('Rate limit')) {
    if (retryCount >= 2) throw new Error('Groq rate limit exceeded')
    const match  = json.error?.message?.match(/try again in ([\d.]+)s/)
    const waitMs = match ? Math.ceil(parseFloat(match[1]) * 1000) + 1000 : 35000
    console.warn(`[Groq] Rate limited — waiting ${Math.ceil(waitMs/1000)}s...`)
    await delay(waitMs)
    return callGroq(prompt, retryCount + 1)
  }

  if (json.error) throw new Error(`Groq: ${json.error.message}`)
  const text = json.choices?.[0]?.message?.content || ''
  if (!text) throw new Error('Groq returned empty response')
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
        if (!parsed[f] || String(parsed[f]).length < 10) throw new Error(`Empty field: "${f}"`)
      }

      // Minimum length check — 1500 chars ≈ 1000 words
      if (parsed.content_en.length < 1500) {
        throw new Error(`Too short: ${parsed.content_en.length} chars — need 1500+`)
      }

      if (isDuplicate(parsed.title_en)) throw new Error(`Duplicate: "${parsed.title_en.slice(0,50)}"`)
      markSeen(parsed.title_en)

      const imageUrl = await fetchUnsplashImage(
        parsed.image_query || IMAGE_QUERY_EXAMPLES[category], category
      )
      const slug = slugify(parsed.title_en, { lower: true, strict: true }).slice(0, 80)
        + '-' + Date.now().toString(36)

      console.log(`[Engine] ✓ ${category}: "${parsed.title_en.slice(0,65)}" (${parsed.content_en.length} chars)`)

      return {
        slug, category,
        image_url:    imageUrl,
        published_at: new Date().toISOString(),
        views:        0,
        read_time:    parsed.read_time || 5,
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
      if (attempt < maxRetries) await delay(2000)
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
    await delay(2000)
  }

  console.log(`[Engine] ${results.length}/6 articles, ${failures.length} failed`)
  if (failures.length) failures.forEach(f => console.error(`  • ${f.category}: ${f.error}`))
  if (results.length === 0) throw new Error('Zero articles — check API keys')
  return results
}
