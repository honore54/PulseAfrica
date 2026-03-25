import { getAuthorForCategory } from './authors.js'
import slugify from 'slugify'

const GROQ_KEY = process.env.GROQ_API_KEY
const GNEWS_KEY = process.env.GNEWS_API_KEY

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
  'Egypt','Morocco','Côte d\'Ivoire','Uganda','Cameroon','Zimbabwe',
  'Mozambique','Angola','Zambia','Mali','DRC','Somalia','Tunisia',
  'Algeria','Botswana','Namibia','Madagascar','Togo',
]

function pickCountry() {
  return AFRICAN_COUNTRIES[Math.floor(Math.random() * AFRICAN_COUNTRIES.length)]
}

const AFRICAN_SPORTS_STARS = [
  'Victor Osimhen','Mohamed Salah','Sadio Mané','Riyad Mahrez',
  'Achraf Hakimi','Edouard Mendy','Kalidou Koulibaly','Thomas Partey',
  'André Onana','Hakim Ziyech','Wilfried Zaha','Serge Gnabry',
  'Youssef En-Nesyri','Sofyan Amrabat','Sébastien Haller','Simon Adingra',
]

const IMAGE_POOLS = {
  politics: [
    '1529107386315-e1a2ed48a620','1541872703-74c5e44368f9',
    '1569025743873-ea3a9ade89f9','1521587760476-6c12a4b040da',
    '1580489944761-15a19d654956','1555848962-6e79583f2078',
  ],
  sports: [
    '1551698618-1dfe5d97d256','1508739773434-c26b3d09e071',
    '1574629810360-7efbbe195018','1594737625785-a6cbdabd333c',
    '1540747913346-19212a4b3993','1517649763962-0c623066013b',
    '1571019614242-c5c5dee9f50b','1552674605-db5fecabfe68',
    '1431324155629-1a5631f47f43','1579952363873-27d3bfad9f57',
  ],
  entertainment: [
    '1514320291841-3b2f730e0c84','1470225620780-dba8ba36b745',
    '1524368535928-5b5e00ddc76b','1598387993441-a364f854c3e1',
    '1429962714451-bb934ecdc4ec','1501612780327-45045538702b',
    '1493225457124-a3eb161ffa5f','1511671782779-c97d3d27a1d4',
    '1493676304819-0d8a8d4c8a0c','1571266752699-7a1cf01af13d',
  ],
  africa: [
    '1509099836639-18ba1795216d','1523805009345-7448845a9e53',
    '1547471080-7cc2caa01a7e','1569025690938-a00729c9e1f9',
    '1504711434969-e33886168f5c','1506905925346-21bda4d32df4',
  ],
  technology: [
    '1518770660439-4636190af475','1485827404703-89b55fcc595e',
    '1461749280684-dccba630e2f6','1550751827-4bd374c3f58b',
    '1526374965328-7f61d4dc18c5','1451187580459-43490279c0fa',
  ],
  business: [
    '1611974789855-9c2a0a7236a3','1579621970563-ebec7221a9a4',
    '1454165804606-c3d57bc86b40','1486406146926-c627a92ad1ab',
    '1560472354-b33ff0c44a43','1556742049-0cfed4f6a45d',
  ],
}

export function getCategoryImage(category, index = null) {
  const pool = IMAGE_POOLS[category] || IMAGE_POOLS.africa
  const idx = index !== null ? index % pool.length : Math.floor(Math.random() * pool.length)
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
    const data = await res.json()
    const photos = data.results || []
    if (photos.length === 0) return getCategoryImage(category)
    const photo = photos[Math.floor(Math.random() * Math.min(photos.length, 3))]
    return photo.urls.regular + '&w=1200&h=675&fit=crop'
  } catch {
    return getCategoryImage(category)
  }
}

// ── GNews queries ─────────────────────────────────────────
const GNEWS_QUERIES = {
  politics:      ['Africa election government 2026','African Union summit 2026','UN Africa diplomacy 2026'],
  africa:        ['Africa economy development 2026','African Union policy 2026','IMF World Bank Africa 2026'],
  technology:    ['Africa fintech startup 2026','Africa technology innovation 2026','Africa mobile internet 2026'],
  business:      ['Africa investment trade 2026','Africa economy GDP 2026','Africa business market 2026'],
}

// ── Sports GNews queries — rotating pool ─────────────────
const SPORTS_GNEWS_QUERIES = [
  'African footballer transfer 2026',
  'AFCON Africa Cup Nations 2026',
  'African player Premier League 2026',
  'CAF Champions League 2026',
  'Africa FIFA World Cup 2026',
  'Basketball Africa League BAL 2026',
  'African athletics world record 2026',
  'African boxer champion title 2026',
  'Mohamed Salah 2026',
  'Victor Osimhen 2026',
  'Achraf Hakimi 2026',
  'Africa rugby tournament 2026',
]

// ── Entertainment GNews queries — REAL sources only ───────
const ENTERTAINMENT_GNEWS_QUERIES = [
  'Burna Boy 2026',
  'Wizkid 2026',
  'Davido 2026',
  'Tems music 2026',
  'Afrobeats music 2026',
  'Nollywood film 2026',
  'African music award 2026',
  'Amapiano 2026',
  'Rema music 2026',
  'Asake music 2026',
  'African Grammy nomination 2026',
  'BET Awards Africa 2026',
  'African Netflix series 2026',
  'Stonebwoy music 2026',
  'Sarkodie 2026',
  'Diamond Platnumz 2026',
  'African music tour concert 2026',
  'Afrobeats chart Billboard 2026',
  'Nollywood Netflix movie 2026',
  'African film festival award 2026',
]

const IMAGE_QUERY_EXAMPLES = {
  politics:      'parliament government officials podium Africa',
  sports:        'football stadium crowd cheering Africa',
  entertainment: 'african music concert stage performance',
  africa:        'african city skyline landscape nature',
  technology:    'african tech startup office laptop',
  business:      'african business meeting office cityscape',
}

// ── Fetch real article — tries multiple queries until found ─
async function fetchRealArticle(category) {
  if (!GNEWS_KEY) return null

  try {
    let queries = []

    if (category === 'sports') {
      // Shuffle and try multiple sports queries
      queries = [...SPORTS_GNEWS_QUERIES].sort(() => Math.random() - 0.5).slice(0, 3)
    } else if (category === 'entertainment') {
      // Shuffle and try multiple entertainment queries — REAL sources only
      queries = [...ENTERTAINMENT_GNEWS_QUERIES].sort(() => Math.random() - 0.5).slice(0, 4)
    } else {
      const q = GNEWS_QUERIES[category] || ['Africa news 2026']
      const idx = Math.floor(Math.random() * q.length)
      queries = [q[idx]]
    }

    // Try each query until we find a real article
    for (const selectedQuery of queries) {
      console.log(`[GNews] Trying: "${selectedQuery}"`)
      const q = encodeURIComponent(selectedQuery)
      const res = await fetch(
        `https://gnews.io/api/v4/search?q=${q}&lang=en&max=10&in=title,description&apikey=${GNEWS_KEY}`,
        { next: { revalidate: 1800 } }
      )
      if (!res.ok) continue
      const data = await res.json()
      const articles = (data.articles || []).filter(a => {
        // Filter out articles older than 30 days
        const pub = new Date(a.publishedAt)
        const daysOld = (Date.now() - pub.getTime()) / (1000 * 60 * 60 * 24)
        return daysOld <= 30
      })
      if (articles.length === 0) continue

      const article = articles[Math.floor(Math.random() * Math.min(articles.length, 5))]
      console.log(`[GNews] ✓ Found real article: "${article.title}"`)
      return {
        title: article.title || '',
        description: article.description || '',
        content: article.content || article.description || '',
        source: article.source?.name || 'African News',
        url: article.url || '',
        publishedAt: article.publishedAt || '',
      }
    }

    console.log(`[GNews] No real articles found for ${category}`)
    return null
  } catch (err) {
    console.log(`[GNews] Failed for ${category}:`, err.message)
    return null
  }
}

function safeParseJSON(text) {
  let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found')
  clean = clean.slice(start, end + 1)
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
  clean = clean.replace(/"([^"]*?)"/g, (match) => {
    return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
  })
  return JSON.parse(clean)
}

// ── Sports prompt ─────────────────────────────────────────
function buildSportsPrompt(realArticle) {
  const star = AFRICAN_SPORTS_STARS[Math.floor(Math.random() * AFRICAN_SPORTS_STARS.length)]
  const country = pickCountry()

  if (realArticle) {
    return `You are a senior sports journalist at PulseAfrica. Reformat this REAL sports article for our African audience.

REAL ARTICLE FROM ${realArticle.source.toUpperCase()} (published ${realArticle.publishedAt}):
Title: ${realArticle.title}
Description: ${realArticle.description}
Content: ${realArticle.content}

CRITICAL RULES:
1. Use ONLY facts from the real article above — NEVER invent scores, fees, quotes or names
2. Write with energy like BBC Sport or ESPN
3. SEO headline must include player/team name + action verb
4. Return ONLY valid JSON

Return this exact JSON:
{"title_en":"Player/team name + action headline max 80 chars","title_fr":"Titre sport français max 80 chars","title_rw":"Umutwe w'imikino Kinyarwanda max 80 chars","summary_en":"2 exciting sentences max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"350-450 word engaging sports article. ## 2-3 subheadings. Real facts only from source.","content_fr":"Article sport français 280-320 mots.","content_rw":"Inkuru y'imikino Kinyarwanda 220-260 amagambo.","tags":["player_name","club","competition","country","sport"],"read_time":4,"location":"City, Country","image_query":"football player action stadium crowd","seo_title":"55-60 char SEO title with keyword first","seo_desc":"150-155 char meta description"}`
  }

  return `You are a senior sports journalist at PulseAfrica. Write a realistic sports article about African sports in 2026.

Write about ONE of these REAL ongoing situations:
- ${star} current season performance or transfer situation
- AFCON 2026 qualification standings
- CAF Champions League current round
- Basketball Africa League (BAL) 2026 season
- Africa 2026 FIFA World Cup preparation

CRITICAL: Write about REAL known players and REAL competitions only. Never invent specific scores or transfer fees.

Return this exact JSON:
{"title_en":"Specific sports headline with real player/competition max 80 chars","title_fr":"Titre sport français max 80 chars","title_rw":"Umutwe w'imikino Kinyarwanda max 80 chars","summary_en":"2 exciting sentences max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"350-450 word sports article. ## 2-3 subheadings. Real facts only.","content_fr":"Article sport français 280-320 mots.","content_rw":"Inkuru y'imikino Kinyarwanda 220-260 amagambo.","tags":["player_name","competition","country","sport","africa"],"read_time":4,"location":"City, ${country}","image_query":"african football player stadium action","seo_title":"55-60 char SEO title","seo_desc":"150-155 char meta description"}`
}

// ── Entertainment prompt — REAL sources only ──────────────
function buildEntertainmentPrompt(realArticle) {
  if (realArticle) {
    return `You are a senior entertainment journalist at PulseAfrica. Reformat this REAL entertainment article for our African audience.

REAL ARTICLE FROM ${realArticle.source.toUpperCase()} (published ${realArticle.publishedAt}):
Title: ${realArticle.title}
Description: ${realArticle.description}
Content: ${realArticle.content}

CRITICAL RULES:
1. Use ONLY facts from the real article — NEVER invent song names, album titles or quotes
2. Write with style of Billboard or OkayAfrica — vibrant and engaging
3. SEO headline must include artist name + action (releases, wins, announces, drops)
4. Connect to African music culture where relevant
5. Return ONLY valid JSON

Return this exact JSON:
{"title_en":"Artist name + action headline max 80 chars","title_fr":"Titre entertainment français max 80 chars","title_rw":"Umutwe Kinyarwanda max 80 chars","summary_en":"2 exciting sentences max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"350-450 word engaging entertainment article. ## 2-3 subheadings. ONLY facts from real article above.","content_fr":"Article entertainment français 280-320 mots.","content_rw":"Inkuru y'abahanzi Kinyarwanda 220-260 amagambo.","tags":["artist_name","song_or_album","genre","country","platform"],"read_time":4,"location":"City, Country","image_query":"african music concert performance stage lights","seo_title":"55-60 char SEO title with artist name first","seo_desc":"150-155 char meta description"}`
  }

  // ── NO real article found — skip rather than hallucinate ──
  // Return null to signal cron to skip this cycle
  return null
}

export async function generateArticle(category) {
  const catMeta = CATEGORIES.find(c => c.id === category) || CATEGORIES[0]
  const realArticle = await fetchRealArticle(category)

  let prompt

  if (category === 'sports') {
    prompt = buildSportsPrompt(realArticle)
  } else if (category === 'entertainment') {
    prompt = buildEntertainmentPrompt(realArticle)
    // If no real article found for entertainment — throw error to skip
    if (!prompt) {
      throw new Error('No real entertainment news found — skipping to avoid hallucination')
    }
  } else if (realArticle) {
    prompt = `You are PulseAfrica, Africa's trilingual news platform. Reformat this REAL news article.

REAL ARTICLE FROM ${realArticle.source.toUpperCase()}:
Title: ${realArticle.title}
Description: ${realArticle.description}
Content: ${realArticle.content}

STRICT RULES:
1. Use ONLY facts from the real article
2. Professional journalistic rewrite
3. Each language must feel native
4. Return ONLY valid JSON

Return this exact JSON:
{"title_en":"SEO headline max 80 chars","title_fr":"Titre français max 80 chars","title_rw":"Umutwe Kinyarwanda max 80 chars","summary_en":"2-sentence summary max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"350-450 word article. ## 2-3 headings. Facts only.","content_fr":"Article français 280-320 mots.","content_rw":"Ingingo Kinyarwanda 220-260 amagambo.","tags":["tag1","tag2","country","topic","africa"],"read_time":4,"location":"City, Country","image_query":"specific 4-5 word Unsplash query","seo_title":"55-60 char SEO title","seo_desc":"150-155 char meta description"}`
  } else {
    const country = pickCountry()
    prompt = `You are PulseAfrica. Generate a realistic ${catMeta.label} news article about ${country} for 2026.

RULES:
1. Write about REAL ongoing situations in ${country} in 2026
2. Use real known leaders — never invent names or statistics
3. Journalistic style — factual and grounded
4. Return ONLY valid JSON

Return this exact JSON:
{"title_en":"SEO headline max 80 chars","title_fr":"Titre français max 80 chars","title_rw":"Umutwe Kinyarwanda max 80 chars","summary_en":"2-sentence summary max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"350-450 word article. ## 2-3 headings.","content_fr":"Article français 280-320 mots.","content_rw":"Ingingo Kinyarwanda 220-260 amagambo.","tags":["tag1","country","topic","africa","category"],"read_time":4,"location":"City, ${country}","image_query":"specific 4-5 word query","seo_title":"55-60 char SEO title","seo_desc":"150-155 char meta description"}`
  }

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
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
  })

  const json = await res.json()
  if (json.error) throw new Error(`Groq error: ${json.error.message}`)
  const text = json.choices?.[0]?.message?.content || ''
  if (!text) throw new Error('Groq returned empty text')

  const parsed = safeParseJSON(text)
  const imageUrl = await fetchUnsplashImage(
    parsed.image_query || IMAGE_QUERY_EXAMPLES[category], category
  )

  const slug = slugify(parsed.title_en || category, { lower: true, strict: true }).slice(0, 80)
    + '-' + Date.now().toString(36)

  return {
    slug,
    category,
    image_url: imageUrl,
    published_at: new Date().toISOString(),
    views: 0,
    read_time: parsed.read_time || 4,
    location: parsed.location || 'Africa',
    tags: parsed.tags || [],
    seo_title: parsed.seo_title || parsed.title_en,
    seo_desc: parsed.seo_desc || parsed.summary_en,
    title_en: parsed.title_en || '',
    title_fr: parsed.title_fr || '',
    title_rw: parsed.title_rw || '',
    summary_en: parsed.summary_en || '',
    summary_fr: parsed.summary_fr || '',
    summary_rw: parsed.summary_rw || '',
    content_en: parsed.content_en || '',
    content_fr: parsed.content_fr || '',
    content_rw: parsed.content_rw || '',
    author_id: getAuthorForCategory(category).id,
  }
}

export async function generateAllCategories() {
  const results = []
  for (const cat of CATEGORIES) {
    try {
      console.log(`[Engine] Generating ${cat.label}...`)
      const article = await generateArticle(cat.id)
      results.push(article)
      console.log(`[Engine] ✓ ${cat.label}: "${(article.title_en || '').slice(0, 60)}"`)
      await new Promise(r => setTimeout(r, 800))
    } catch (err) {
      console.error(`[Engine] ✗ Skipped ${cat.id}: ${err.message}`)
    }
  }
  return results
}
