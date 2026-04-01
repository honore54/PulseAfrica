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
    'Africa election 2026','African Union summit 2026','UN Africa diplomacy',
    'Africa government reform','Africa president parliament 2026',
    'Rwanda Kenya Ghana politics','Africa coup election protest',
    'Africa sanctions peace deal','Africa opposition leader',
    'South Africa Nigeria politics','Africa minister policy',
    'African democracy human rights','Africa foreign policy',
    'Africa security conflict 2026','Africa regional bloc summit',
  ],
  africa: [
    'Africa economy development 2026','African Union policy',
    'IMF World Bank Africa','Africa infrastructure investment',
    'Africa climate change','Africa food security crisis',
    'Africa health WHO','Africa migration displacement',
    'Africa education poverty','Africa humanitarian aid',
    'Africa drought flood','Africa renewable energy',
    'Africa debt relief','Africa diaspora remittance',
    'Africa continental news',
  ],
  technology: [
    'Africa fintech startup 2026','Africa technology innovation',
    'Africa mobile internet','Africa AI artificial intelligence',
    'Africa tech hub startup','Africa cryptocurrency blockchain',
    'Africa solar energy technology','Africa 5G connectivity',
    'Nigeria Kenya tech ecosystem','Africa digital payment',
    'Africa e-commerce','Africa cybersecurity',
    'Africa space satellite','Africa edtech healthtech',
    'Africa smartphone access',
  ],
  business: [
    'Africa investment trade 2026','Africa economy GDP',
    'Africa business market','Africa stock exchange',
    'Africa oil commodity price','Africa startup funding round',
    'Africa agriculture export','Africa banking finance',
    'Africa AFCFTA trade deal','Africa private equity',
    'Africa IMF loan','Africa mining resources',
    'Africa manufacturing','Africa logistics supply chain',
    'Africa forex currency',
  ],
  sports: [
    'African footballer transfer 2026','AFCON Africa Cup Nations',
    'African player Premier League','CAF Champions League 2026',
    'Africa FIFA World Cup 2026','Basketball Africa League',
    'Mohamed Salah 2026','Victor Osimhen 2026','Achraf Hakimi',
    'Africa athletics 2026','Africa rugby','African boxing champion',
    'Sadio Mane club','Andre Onana','CAF Confederation Cup',
    'Wilfried Zaha','Africa tennis','Africa cricket',
    'African sports result','Riyad Mahrez',
  ],
  entertainment: [
    'Afrobeats music 2026','African music award 2026','Nollywood film 2026',
    'Burna Boy 2026','Wizkid music 2026','Davido 2026',
    'Tems music 2026','Rema Afrobeats','Amapiano chart 2026',
    'African Grammy 2026','BET Awards Africa','African Netflix series',
    'Stonebwoy music','Sarkodie Ghana','Diamond Platnumz',
    'African music tour','Nollywood box office','Tyla music',
    'Asake concert','Ayra Starr music','Afrobeats streaming record',
    'African artist collaboration','Africa pop culture 2026',
    'African concert event','Afrobeats UK chart',
  ],
}

const NEWSDATA_CATEGORY_MAP = {
  politics: 'politics', sports: 'sports', entertainment: 'entertainment',
  africa: 'world', technology: 'technology', business: 'business',
}

const GNEWS_TOPIC_MAP = {
  politics: 'nation', sports: 'sports', entertainment: 'entertainment',
  technology: 'technology', business: 'business', africa: 'nation',
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
  for (const [k, ts] of _seenTitles) {
    if (now - ts > TTL) _seenTitles.delete(k)
  }
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
  return articles.slice(0, Math.min(5, articles.length))[Math.floor(Math.random() * Math.min(5, articles.length))]
}

async function gnewsSearch(query, maxDays = 30) {
  const res = await fetch(
    `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&sortby=publishedAt&in=title,description&apikey=${GNEWS_KEY}`,
    { next: { revalidate: 900 } }
  )
  if (res.status === 429) throw new Error('GNEWS_RATE_LIMITED')
  if (!res.ok) throw new Error(`GNews HTTP ${res.status}`)
  const data = await res.json()
  return (data.articles || []).filter(a => {
    const age = (Date.now() - new Date(a.publishedAt).getTime()) / 86400000
    return age <= maxDays && !isDuplicate(a.title)
  })
}

async function gnewsTopHeadlines(category) {
  const res = await fetch(
    `https://gnews.io/api/v4/top-headlines?topic=${GNEWS_TOPIC_MAP[category] || 'nation'}&lang=en&max=10&sortby=publishedAt&apikey=${GNEWS_KEY}`,
    { next: { revalidate: 900 } }
  )
  if (res.status === 429) throw new Error('GNEWS_RATE_LIMITED')
  if (!res.ok) throw new Error(`GNews headlines HTTP ${res.status}`)
  const data = await res.json()
  return (data.articles || []).filter(a => !isDuplicate(a.title))
}

function formatGnews(a) {
  return {
    title:       a.title       || '',
    description: a.description || '',
    content:     a.content     || a.description || '',
    source:      a.source?.name || 'African News',
    url:         a.url          || '',
    publishedAt: a.publishedAt  || new Date().toISOString(),
  }
}

async function newsdataSearch(query, category) {
  if (!NEWSDATA_KEY) throw new Error('NEWSDATA_KEY not configured')
  const cat = NEWSDATA_CATEGORY_MAP[category] || 'world'
  const res = await fetch(
    `https://newsdata.io/api/1/news?apikey=${NEWSDATA_KEY}&q=${encodeURIComponent(query)}&language=en&category=${cat}&country=ng,ke,gh,za,rw,et,eg,ma,tz,ug&prioritydomain=top`,
    { next: { revalidate: 900 } }
  )
  if (res.status === 429) throw new Error('NEWSDATA_RATE_LIMITED')
  if (!res.ok) throw new Error(`NewsData HTTP ${res.status}`)
  const data = await res.json()
  return (data.results || [])
    .filter(a => a.title && a.description && !isDuplicate(a.title))
    .map(a => ({
      title:       a.title,
      description: a.description || '',
      content:     a.content     || a.description || '',
      source:      a.source_id   || 'African News',
      url:         a.link        || '',
      publishedAt: a.pubDate     || new Date().toISOString(),
    }))
}

async function newsdataLatest(category) {
  if (!NEWSDATA_KEY) throw new Error('NEWSDATA_KEY not configured')
  const cat = NEWSDATA_CATEGORY_MAP[category] || 'world'
  const res = await fetch(
    `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_KEY}&language=en&category=${cat}&country=ng,ke,gh,za,rw,et,eg,ma,tz,ug`,
    { next: { revalidate: 900 } }
  )
  if (res.status === 429) throw new Error('NEWSDATA_RATE_LIMITED')
  if (!res.ok) throw new Error(`NewsData latest HTTP ${res.status}`)
  const data = await res.json()
  return (data.results || [])
    .filter(a => a.title && !isDuplicate(a.title))
    .map(a => ({
      title:       a.title,
      description: a.description || '',
      content:     a.content     || a.description || '',
      source:      a.source_id   || 'African News',
      url:         a.link        || '',
      publishedAt: a.pubDate     || new Date().toISOString(),
    }))
}

export async function fetchRealArticle(category) {
  const pool    = [...(GNEWS_QUERIES[category] || [])].sort(() => Math.random() - 0.5)
  const sample5 = pool.slice(0, 5)

  if (GNEWS_KEY) {
    for (const query of sample5) {
      try {
        console.log(`[GNews:${category}] "${query}"`)
        const articles = await gnewsSearch(query)
        const pick     = pickBest(articles)
        if (pick) { console.log(`[GNews:${category}] ✓ "${pick.title}"`); return formatGnews(pick) }
      } catch (err) {
        if (err.message === 'GNEWS_RATE_LIMITED') { console.warn(`[GNews] Rate limited — switching to NewsData`); break }
        console.warn(`[GNews:${category}] "${query}": ${err.message}`)
      }
    }
    try {
      console.log(`[GNews:${category}] Trying top-headlines...`)
      const articles = await gnewsTopHeadlines(category)
      const pick     = pickBest(articles)
      if (pick) { console.log(`[GNews:${category}] ✓ Headline: "${pick.title}"`); return formatGnews(pick) }
    } catch (err) {
      console.warn(`[GNews:${category}] Headlines: ${err.message}`)
    }
  }

  if (NEWSDATA_KEY) {
    for (const query of pool.slice(0, 3)) {
      try {
        console.log(`[NewsData:${category}] "${query}"`)
        const results = await newsdataSearch(query, category)
        const pick    = pickBest(results)
        if (pick) { console.log(`[NewsData:${category}] ✓ "${pick.title}"`); return pick }
      } catch (err) {
        if (err.message === 'NEWSDATA_RATE_LIMITED') { console.warn(`[NewsData] Rate limited`); break }
        console.warn(`[NewsData:${category}] "${query}": ${err.message}`)
      }
    }
    try {
      console.log(`[NewsData:${category}] Trying latest headlines...`)
      const results = await newsdataLatest(category)
      const pick    = pickBest(results)
      if (pick) { console.log(`[NewsData:${category}] ✓ Latest: "${pick.title}"`); return pick }
    } catch (err) {
      console.warn(`[NewsData:${category}] Latest: ${err.message}`)
    }
  }

  if (GNEWS_KEY) {
    try {
      console.log(`[GNews:${category}] Absolute fallback: "Africa"`)
      const articles = await gnewsSearch('Africa', 60)
      const pick     = pickBest(articles)
      if (pick) { console.log(`[GNews:${category}] ✓ Fallback: "${pick.title}"`); return formatGnews(pick) }
    } catch (err) {
      console.warn(`[GNews:${category}] Fallback: ${err.message}`)
    }
  }

  throw new Error(`No real article found for "${category}" — all 5 stages exhausted`)
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

const WRITING_STYLE = {
  sports:        'Write with the energy of BBC Sport Africa. Lead with the athlete or competition name.',
  entertainment: 'Write with the vibrancy of Billboard Africa or OkayAfrica. Connect to Afrobeats/Amapiano culture.',
  politics:      'Write with the authority of Al Jazeera Africa. Focus on policy impact for citizens.',
  technology:    'Write with the insight of TechCabal. Highlight African tech ecosystem growth.',
  business:      'Write with the precision of Bloomberg Africa. Lead with the economic figure.',
  africa:        'Write with the depth of The Africa Report. Connect the story to continental development.',
}

const JSON_SCHEMA = `{
  "title_en":    "SEO headline max 80 chars — lead with primary keyword",
  "title_fr":    "Titre français max 80 chars — écrit nativement",
  "title_rw":    "Umutwe Kinyarwanda max 80 chars — wanditswe neza",
  "summary_en":  "2 punchy sentences max 200 chars — hook the reader immediately",
  "summary_fr":  "Résumé 2 phrases max 200 caractères",
  "summary_rw":  "Incamake interuro 2 max 200 inyuguti",
  "content_en":  "400-450 words. ## 2-3 subheadings. ONLY facts from the source article.",
  "content_fr":  "300-340 mots. ## sous-titres. Mêmes faits uniquement.",
  "content_rw":  "230-270 amagambo. ## inshuti. Ibintu bya nyayo gusa.",
  "tags":        ["entity","entity","country","category","africa"],
  "read_time":   4,
  "location":    "City, Country",
  "image_query": "4-5 word Unsplash landscape query for this specific story",
  "seo_title":   "55-60 chars — primary keyword first, for Google ranking",
  "seo_desc":    "150-155 chars — compelling, includes primary keyword"
}`

function buildPrompt(category, realArticle) {
  const catLabel = CATEGORIES.find(c => c.id === category)?.label || category
  return `You are a senior ${catLabel} journalist at PulseAfrica, Africa's leading trilingual news platform.

REAL SOURCE ARTICLE:
Source: ${realArticle.source} (published ${realArticle.publishedAt})
Title: ${realArticle.title}
Description: ${realArticle.description}
Content: ${realArticle.content}

WRITING STYLE: ${WRITING_STYLE[category] || 'Write with professional journalistic authority.'}

ABSOLUTE RULES:
1. Use ONLY facts from the source article — never invent quotes, scores, statistics or names
2. Do NOT add knowledge not present in the article above
3. Each language (EN/FR/RW) must feel natively written, not machine-translated
4. title_en must start with the primary keyword (name, country, event, company)
5. seo_title must be exactly 55-60 characters
6. tags: exactly 5 specific lowercase tags
7. Return ONLY valid JSON — no preamble, no markdown fences

${JSON_SCHEMA}`
}

async function callGroq(prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model:           'llama-3.3-70b-versatile',
      messages:        [{ role: 'user', content: prompt }],
      max_tokens:      2500,
      temperature:     0.2,
      response_format: { type: 'json_object' },
    }),
  })
  const json = await res.json()
  if (json.error) throw new Error(`Groq: ${json.error.message}`)
  const text = json.choices?.[0]?.message?.content || ''
  if (!text) throw new Error('Groq returned empty response')
  return text
}

export async function generateArticle(category, maxRetries = 3) {
  let lastError
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Engine] ${category.toUpperCase()} — attempt ${attempt}/${maxRetries}`)
      const realArticle = await fetchRealArticle(category)
      const prompt      = buildPrompt(category, realArticle)
      const rawText     = await callGroq(prompt)
      const parsed      = safeParseJSON(rawText)
      for (const f of ['title_en','content_en','summary_en','title_fr','title_rw','seo_title','seo_desc']) {
        if (!parsed[f] || String(parsed[f]).length < 10) throw new Error(`Empty field: "${f}"`)
      }
      if (isDuplicate(parsed.title_en)) throw new Error(`Duplicate: "${parsed.title_en.slice(0,60)}"`)
      markSeen(parsed.title_en)
      const imageUrl = await fetchUnsplashImage(parsed.image_query || IMAGE_QUERY_EXAMPLES[category], category)
      const slug     = slugify(parsed.title_en, { lower: true, strict: true }).slice(0, 80) + '-' + Date.now().toString(36)
      console.log(`[Engine] ✓ ${category}: "${parsed.title_en.slice(0, 65)}"`)
      return {
        slug, category,
        image_url:    imageUrl,
        published_at: new Date().toISOString(),
        views: 0,
        read_time:    parsed.read_time || 4,
        location:     parsed.location  || 'Africa',
        tags:         Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
        seo_title:    parsed.seo_title,
        seo_desc:     parsed.seo_desc,
        source_url:   realArticle.url,
        source_name:  realArticle.source,
        title_en:   parsed.title_en,   title_fr:   parsed.title_fr,   title_rw:   parsed.title_rw,
        summary_en: parsed.summary_en, summary_fr: parsed.summary_fr, summary_rw: parsed.summary_rw,
        content_en: parsed.content_en, content_fr: parsed.content_fr, content_rw: parsed.content_rw,
        author_id:  getAuthorForCategory(category).id,
      }
    } catch (err) {
      lastError = err
      console.warn(`[Engine] ✗ ${category} attempt ${attempt}: ${err.message}`)
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, attempt * 1500))
    }
  }
  throw new Error(`${category} failed all ${maxRetries} attempts — ${lastError?.message}`)
}

export async function generateAllCategories() {
  console.log(`\n[Engine] SESSION ${new Date().toISOString()}`)
  console.log(`[Engine] GNews=${GNEWS_KEY?'✓':'MISSING'}  NewsData=${NEWSDATA_KEY?'✓':'add NEWSDATA_API_KEY'}  Groq=${GROQ_KEY?'✓':'MISSING'}`)
  const results  = []
  const failures = []
  for (const cat of CATEGORIES) {
    try {
      results.push(await generateArticle(cat.id, 3))
    } catch (err) {
      console.error(`[Engine] PERMANENT FAIL ${cat.id}: ${err.message}`)
      failures.push({ category: cat.id, error: err.message })
    }
    if (results.length + failures.length < CATEGORIES.length) {
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  console.log(`[Engine] ${results.length}/6 articles generated, ${failures.length} failed`)
  if (failures.length) failures.forEach(f => console.error(`  • ${f.category}: ${f.error}`))
  if (results.length === 0) throw new Error('Zero articles — check GNEWS_API_KEY + GROQ_API_KEY')
  return results
}
