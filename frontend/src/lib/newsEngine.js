import slugify from 'slugify'

const GROQ_KEY = process.env.GROQ_API_KEY
const GNEWS_KEY = process.env.GNEWS_API_KEY

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

// ── GNews queries: 70% Africa, 30% World ─────────────────
// Index 0 & 1 = Africa (70%), Index 2 = World (30%)
const GNEWS_QUERIES = {
  politics:      ['Africa politics', 'Africa government election', 'world politics breaking'],
  sports:        ['Africa sports', 'Africa football championship', 'world sports latest'],
  entertainment: ['Africa entertainment', 'Africa music Afrobeats', 'world entertainment news'],
  africa:        ['Africa news', 'Africa development economy', 'Africa news today'],
  technology:    ['Africa technology', 'Africa tech startup innovation', 'world technology breaking'],
  business:      ['Africa business', 'Africa economy investment', 'world business markets'],
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

// ── Fetch real article from GNews API ────────────────────
async function fetchRealArticle(category) {
  if (!GNEWS_KEY) {
    console.log('[GNews] No API key found')
    return null
  }

  try {
    // 70% Africa (rand < 0.70 picks index 0 or 1), 30% World (rand >= 0.70 picks index 2)
    const rand = Math.random()
    const queries = GNEWS_QUERIES[category] || ['Africa news', 'Africa news', 'world news']
    const queryIndex = rand < 0.35 ? 0 : rand < 0.70 ? 1 : 2
    const selectedQuery = queries[queryIndex]

    console.log(`[GNews] Query (${queryIndex < 2 ? 'Africa 🌍' : 'World 🌐'}): "${selectedQuery}"`)

    const q = encodeURIComponent(selectedQuery)
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=${q}&lang=en&max=10&in=title,description&apikey=${GNEWS_KEY}`,
      { next: { revalidate: 1800 } }
    )
    if (!res.ok) {
      console.log(`[GNews] HTTP error ${res.status} for ${category}`)
      return null
    }
    const data = await res.json()
    const articles = data.articles || []
    if (articles.length === 0) {
      console.log(`[GNews] No articles found for ${category}`)
      return null
    }

    // Pick a random article from top 5
    const article = articles[Math.floor(Math.random() * Math.min(articles.length, 5))]
    console.log(`[GNews] ✓ Got real article for ${category}: "${article.title}"`)
    return {
      title: article.title || '',
      description: article.description || '',
      content: article.content || article.description || '',
      source: article.source?.name || 'African News',
      url: article.url || '',
      publishedAt: article.publishedAt || '',
    }
  } catch (err) {
    console.log(`[GNews] Failed for ${category}:`, err.message)
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

// ── Core: Generate one full article with AI ───────────────
export async function generateArticle(category) {
  const catMeta = CATEGORIES.find(c => c.id === category) || CATEGORIES[0]

  // Fetch a real article from GNews
  const realArticle = await fetchRealArticle(category)

  let prompt

  if (realArticle) {
    // ── MODE 1: Real article exists — AI only translates & formats ──
    console.log(`[AI] Using real GNews article for ${category}`)
    prompt = `You are PulseAfrica, Africa's trilingual news platform. Your job is to reformat and translate the following REAL news article into our publishing format.

REAL ARTICLE FROM ${realArticle.source.toUpperCase()}:
Title: ${realArticle.title}
Description: ${realArticle.description}
Content: ${realArticle.content}
Published: ${realArticle.publishedAt}

STRICT RULES — THIS IS CRITICAL:
1. Use ONLY the facts from the real article above — do NOT add, invent or assume any facts
2. Do NOT invent names, scores, statistics or quotes that are not in the source
3. If a quote is not in the source, do not make one up — paraphrase instead
4. Translate faithfully to French and Kinyarwanda — keep all facts identical
5. The English version should be a professional rewrite of the real article
6. Return ONLY valid JSON — no markdown, no text outside JSON
7. For image_query: write a SPECIFIC 4-5 word Unsplash query matching the article topic e.g. "${IMAGE_QUERY_EXAMPLES[category]}"

Return this exact JSON:
{"title_en":"English headline max 80 chars","title_fr":"Titre français max 80 chars","title_rw":"Umutwe Kinyarwanda max 80 chars","summary_en":"2-sentence English summary max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"Professional English rewrite of the real article 300-400 words. Use ## for 2-3 headings. Only facts from source.","content_fr":"Article français 250-300 mots. Utilise ## pour sous-titres. Mêmes faits que l'anglais.","content_rw":"Ingingo Kinyarwanda 200-250 amagambo. Koresha ## kubara interuro. Ukuri gusa.","tags":["tag1","tag2","tag3","tag4","tag5"],"read_time":4,"location":"City, Country","image_query":"specific 4-5 word query matching article topic","seo_title":"60-char SEO title","seo_desc":"150-char meta description"}`

  } else {
    // ── MODE 2: No real article — AI generates but stays grounded ──
    const country = pickCountry()
    const country2 = pickCountry()
    console.log(`[AI] No real article found, generating grounded article for ${category} about ${country}`)
    prompt = `You are PulseAfrica, Africa's premier AI-powered news publication. Generate a realistic news article for the "${catMeta.label}" category focused on ${country} (mention ${country2} as secondary).

STRICT RULES:
1. Write about REAL ongoing situations in ${country} that are actually happening in 2026
2. Use REAL known leaders and officials of ${country} — do NOT invent fake names
3. Do NOT invent specific scores, exact statistics or direct quotes you are not sure about
4. Write in a journalistic style — factual, grounded, no sensationalism
5. Each language version must feel native, NOT like a translation
6. Return ONLY valid JSON — no markdown, no text outside JSON, no newlines inside string values
7. For image_query: write a SPECIFIC 4-5 word Unsplash query e.g. "${IMAGE_QUERY_EXAMPLES[category]}"

Return this exact JSON:
{"title_en":"English headline max 80 chars","title_fr":"Titre français max 80 chars","title_rw":"Umutwe Kinyarwanda max 80 chars","summary_en":"2-sentence English summary max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"Grounded English article 300-400 words. Use ## for 2-3 headings. Real facts only. End with forward-looking paragraph.","content_fr":"Article français 250-300 mots. Utilise ## pour sous-titres.","content_rw":"Ingingo Kinyarwanda 200-250 amagambo. Koresha ## kubara interuro.","tags":["tag1","tag2","tag3","tag4","tag5"],"read_time":4,"location":"City, ${country}","image_query":"specific 4-5 word query matching article topic","seo_title":"60-char SEO title","seo_desc":"150-char meta description"}`
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
  console.log('[GROQ] Raw response:', JSON.stringify(json).slice(0, 300))
  if (json.error) throw new Error(`Groq error: ${json.error.message}`)
  const text = json.choices?.[0]?.message?.content || ''
  if (!text) throw new Error('Groq returned empty text')

  const parsed = safeParseJSON(text)

  const imageUrl = await fetchUnsplashImage(parsed.image_query || IMAGE_QUERY_EXAMPLES[category], category)

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
      await new Promise(r => setTimeout(r, 800))
    } catch (err) {
      console.error(`[AI] ✗ Failed ${cat.id}:`, err.message)
    }
  }
  return results
}