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
  'André Onana','Hakim Ziyech','Wilfried Zaha','Youssef En-Nesyri',
  'Sofyan Amrabat','Sébastien Haller','Simon Adingra',
]

const IMAGE_POOLS = {
  politics: ['1529107386315-e1a2ed48a620','1541872703-74c5e44368f9','1569025743873-ea3a9ade89f9','1521587760476-6c12a4b040da','1580489944761-15a19d654956'],
  sports:   ['1551698618-1dfe5d97d256','1508739773434-c26b3d09e071','1574629810360-7efbbe195018','1594737625785-a6cbdabd333c','1540747913346-19212a4b3993','1517649763962-0c623066013b','1571019614242-c5c5dee9f50b','1552674605-db5fecabfe68'],
  entertainment: ['1514320291841-3b2f730e0c84','1470225620780-dba8ba36b745','1524368535928-5b5e00ddc76b','1598387993441-a364f854c3e1','1429962714451-bb934ecdc4ec','1501612780327-45045538702b','1493225457124-a3eb161ffa5f','1511671782779-c97d3d27a1d4'],
  africa:   ['1509099836639-18ba1795216d','1523805009345-7448845a9e53','1547471080-7cc2caa01a7e','1569025690938-a00729c9e1f9','1504711434969-e33886168f5c'],
  technology: ['1518770660439-4636190af475','1485827404703-89b55fcc595e','1461749280684-dccba630e2f6','1550751827-4bd374c3f58b','1526374965328-7f61d4dc18c5'],
  business: ['1611974789855-9c2a0a7236a3','1579621970563-ebec7221a9a4','1454165804606-c3d57bc86b40','1486406146926-c627a92ad1ab','1560472354-b33ff0c44a43'],
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
  politics:    ['Africa election government 2026','African Union summit 2026','UN Africa diplomacy 2026'],
  africa:      ['Africa economy development 2026','African Union policy 2026','IMF World Bank Africa 2026'],
  technology:  ['Africa fintech startup 2026','Africa technology innovation 2026','Africa mobile internet 2026'],
  business:    ['Africa investment trade 2026','Africa economy GDP 2026','Africa business market 2026'],
}

// ── Sports GNews queries ──────────────────────────────────
const SPORTS_GNEWS_QUERIES = [
  'African footballer transfer 2026',
  'AFCON Africa Cup Nations 2026',
  'African player Premier League 2026',
  'CAF Champions League 2026',
  'Africa FIFA World Cup 2026',
  'Basketball Africa League 2026',
  'Mohamed Salah 2026',
  'Victor Osimhen 2026',
  'Achraf Hakimi 2026',
  'Africa athletics world record 2026',
  'Africa rugby 2026',
  'African boxing champion 2026',
]

// ── Entertainment GNews queries — broad to always find news ─
const ENTERTAINMENT_GNEWS_QUERIES = [
  'Afrobeats music 2026',
  'African music 2026',
  'Nollywood 2026',
  'Burna Boy',
  'Wizkid music',
  'Davido',
  'Tems',
  'Rema music',
  'Amapiano 2026',
  'African Grammy 2026',
  'BET Awards 2026',
  'African Netflix 2026',
  'Afrobeats chart 2026',
  'African artist award 2026',
  'Stonebwoy',
  'Sarkodie',
  'Diamond Platnumz',
  'African music tour 2026',
  'Nollywood movie 2026',
  'African film 2026',
  'Tyla music 2026',
  'Asake 2026',
  'Ayra Starr',
  'African concert 2026',
  'music Africa trending',
]

const IMAGE_QUERY_EXAMPLES = {
  politics:      'parliament government officials podium Africa',
  sports:        'football stadium crowd cheering Africa',
  entertainment: 'african music concert stage performance',
  africa:        'african city skyline landscape nature',
  technology:    'african tech startup office laptop',
  business:      'african business meeting office cityscape',
}

// ── Fetch real article — tries multiple queries ───────────
async function fetchRealArticle(category) {
  if (!GNEWS_KEY) return null

  let queries = []

  if (category === 'sports') {
    queries = [...SPORTS_GNEWS_QUERIES].sort(() => Math.random() - 0.5).slice(0, 4)
  } else if (category === 'entertainment') {
    // Use many broad queries to maximize chance of finding real news
    queries = [...ENTERTAINMENT_GNEWS_QUERIES].sort(() => Math.random() - 0.5).slice(0, 6)
  } else {
    const q = GNEWS_QUERIES[category] || ['Africa news 2026']
    queries = [q[Math.floor(Math.random() * q.length)]]
  }

  for (const selectedQuery of queries) {
    try {
      console.log(`[GNews] Trying: "${selectedQuery}"`)
      const q = encodeURIComponent(selectedQuery)
      const res = await fetch(
        `https://gnews.io/api/v4/search?q=${q}&lang=en&max=10&in=title,description&apikey=${GNEWS_KEY}`,
        { next: { revalidate: 900 } }
      )
      if (!res.ok) continue
      const data = await res.json()
      const articles = (data.articles || []).filter(a => {
        const pub = new Date(a.publishedAt)
        const daysOld = (Date.now() - pub.getTime()) / (1000 * 60 * 60 * 24)
        return daysOld <= 60
      })
      if (articles.length === 0) continue

      const article = articles[Math.floor(Math.random() * Math.min(articles.length, 5))]
      console.log(`[GNews] ✓ Found: "${article.title}"`)
      return {
        title: article.title || '',
        description: article.description || '',
        content: article.content || article.description || '',
        source: article.source?.name || 'African News',
        url: article.url || '',
        publishedAt: article.publishedAt || '',
      }
    } catch (err) {
      console.log(`[GNews] Query failed: ${err.message}`)
      continue
    }
  }

  console.log(`[GNews] No articles found for ${category} after all queries`)
  return null
}

// ── Real 2026 entertainment facts for grounded fallback ───
const ENTERTAINMENT_FACTS_2026 = [
  { artist: 'Burna Boy', fact: 'is selling out stadiums worldwide in 2026 and has been described as Africa\'s biggest music export', genre: 'Afrobeats' },
  { artist: 'Tems', fact: 'won a Grammy Award and continues to dominate global charts in 2026 with her soulful Afrobeats sound', genre: 'Afrobeats' },
  { artist: 'Rema', fact: 'broke streaming records globally and continues to grow his international fanbase in 2026', genre: 'Afrobeats' },
  { artist: 'Wizkid', fact: 'is landing global hits and collaborating with international artists in 2026', genre: 'Afrobeats' },
  { artist: 'Tyla', fact: 'is representing South Africa globally and pushing Amapiano into mainstream charts in 2026', genre: 'Amapiano' },
  { artist: 'Ayra Starr', fact: 'is one of Nigeria\'s fastest rising stars in 2026 with growing international recognition', genre: 'Afrobeats' },
  { artist: 'Kabza De Small', fact: 'remains Amapiano\'s king in 2026 with new releases dominating South African charts', genre: 'Amapiano' },
  { artist: 'Black Sherif', fact: 'continues to merge Afrobeats with highlife and street influences in 2026', genre: 'Afrobeats' },
  { artist: 'Diamond Platnumz', fact: 'remains East Africa\'s biggest music star in 2026 with massive reach across the continent', genre: 'Bongo' },
  { artist: 'Stonebwoy', fact: 'is Ghana\'s Afro-dancehall legend continuing to release powerful music in 2026', genre: 'Afro-dancehall' },
]

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
1. Use ONLY facts from the real article — NEVER invent scores, fees or quotes
2. Write with energy like BBC Sport or ESPN
3. SEO headline must include player/team name + action verb
4. Return ONLY valid JSON

Return this exact JSON:
{"title_en":"Player/team + action headline max 80 chars","title_fr":"Titre sport français max 80 chars","title_rw":"Umutwe w'imikino Kinyarwanda max 80 chars","summary_en":"2 exciting sentences max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"350-450 word engaging sports article. ## 2-3 subheadings. Real facts only.","content_fr":"Article sport français 280-320 mots.","content_rw":"Inkuru y'imikino Kinyarwanda 220-260 amagambo.","tags":["player_name","club","competition","country","sport"],"read_time":4,"location":"City, Country","image_query":"football player action stadium crowd","seo_title":"55-60 char SEO title with keyword first","seo_desc":"150-155 char meta description"}`
  }

  return `You are a senior sports journalist at PulseAfrica. Write a realistic sports article about African sports in 2026.

Write about ONE real ongoing situation — choose randomly:
- ${star} current 2026 season performance or transfer situation
- AFCON 2026 qualification standings update
- CAF Champions League 2026 current round results
- Basketball Africa League (BAL) 2026 season update
- Africa 2026 FIFA World Cup squad preparation news

CRITICAL: Only write about REAL players and REAL competitions. Never invent specific scores or fees.

Return this exact JSON:
{"title_en":"Specific sports headline with real player/competition max 80 chars","title_fr":"Titre sport français max 80 chars","title_rw":"Umutwe w'imikino Kinyarwanda max 80 chars","summary_en":"2 exciting sentences max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"350-450 word sports article. ## 2-3 subheadings. Real facts only.","content_fr":"Article sport français 280-320 mots.","content_rw":"Inkuru y'imikino Kinyarwanda 220-260 amagambo.","tags":["player_name","competition","country","sport","africa"],"read_time":4,"location":"City, ${country}","image_query":"african football player stadium action","seo_title":"55-60 char SEO title","seo_desc":"150-155 char meta description"}`
}

// ── Entertainment prompt — real or grounded fallback ──────
function buildEntertainmentPrompt(realArticle) {
  if (realArticle) {
    return `You are a senior entertainment journalist at PulseAfrica. Reformat this REAL entertainment article for our African audience.

REAL ARTICLE FROM ${realArticle.source.toUpperCase()} (published ${realArticle.publishedAt}):
Title: ${realArticle.title}
Description: ${realArticle.description}
Content: ${realArticle.content}

CRITICAL RULES:
1. Use ONLY facts from the real article — NEVER invent song names, albums or quotes not in the source
2. Write with style of Billboard or OkayAfrica — vibrant, cultural, engaging
3. SEO headline must include artist name + action (releases, wins, announces, breaks record)
4. Connect to African music culture (Afrobeats, Amapiano, Nollywood etc.)
5. Return ONLY valid JSON

Return this exact JSON:
{"title_en":"Artist name + action headline max 80 chars","title_fr":"Titre entertainment français max 80 chars","title_rw":"Umutwe Kinyarwanda max 80 chars","summary_en":"2 exciting sentences max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"350-450 word engaging entertainment article. ## 2-3 subheadings. ONLY facts from real article.","content_fr":"Article entertainment français 280-320 mots.","content_rw":"Inkuru y'abahanzi Kinyarwanda 220-260 amagambo.","tags":["artist_name","genre","country","music_platform","award_or_event"],"read_time":4,"location":"City, Country","image_query":"african music concert performance stage lights","seo_title":"55-60 char SEO title with artist name first","seo_desc":"150-155 char meta description"}`
  }

  // ── Grounded fallback using verified 2026 facts ───────
  const fact = ENTERTAINMENT_FACTS_2026[Math.floor(Math.random() * ENTERTAINMENT_FACTS_2026.length)]
  console.log(`[Entertainment] Using grounded fallback for: ${fact.artist}`)

  return `You are a senior entertainment journalist at PulseAfrica. Write a trending entertainment news article about ${fact.artist} in 2026.

VERIFIED FACT: ${fact.artist} ${fact.fact}. Genre: ${fact.genre}.

CRITICAL RULES:
1. Write about ${fact.artist}'s current 2026 status, impact and what they mean for African music
2. You may discuss their general 2026 activities but DO NOT invent specific song titles, album names or exact quotes
3. Write as a cultural analysis piece: their rise, impact on African music globally, fan base growth
4. Make it feel like a Billboard or OkayAfrica feature article
5. Include context about how ${fact.genre} is growing globally in 2026
6. Return ONLY valid JSON

Return this exact JSON:
{"title_en":"${fact.artist} headline about their 2026 impact max 80 chars","title_fr":"Titre sur ${fact.artist} en 2026 max 80 chars","title_rw":"Umutwe wa ${fact.artist} 2026 Kinyarwanda max 80 chars","summary_en":"2 exciting sentences about ${fact.artist} in 2026 max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"350-450 word cultural feature about ${fact.artist} and ${fact.genre} in 2026. ## 2-3 subheadings. No invented song titles.","content_fr":"Article entertainment français 280-320 mots.","content_rw":"Inkuru y'abahanzi Kinyarwanda 220-260 amagambo.","tags":["${fact.artist.toLowerCase().replace(/ /g,'_')}","${fact.genre.toLowerCase()}","african_music","2026","africa"],"read_time":4,"location":"Lagos, Nigeria","image_query":"african music concert performance stage lights crowd","seo_title":"55-60 char SEO title with ${fact.artist} name","seo_desc":"150-155 char meta description about ${fact.artist}"}`
}

export async function generateArticle(category) {
  const catMeta = CATEGORIES.find(c => c.id === category) || CATEGORIES[0]
  const realArticle = await fetchRealArticle(category)

  let prompt

  if (category === 'sports') {
    prompt = buildSportsPrompt(realArticle)
  } else if (category === 'entertainment') {
    // Always builds a prompt — real article or grounded fallback
    prompt = buildEntertainmentPrompt(realArticle)
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
    slug, category, image_url: imageUrl,
    published_at: new Date().toISOString(),
    views: 0, read_time: parsed.read_time || 4,
    location: parsed.location || 'Africa',
    tags: parsed.tags || [],
    seo_title: parsed.seo_title || parsed.title_en,
    seo_desc: parsed.seo_desc || parsed.summary_en,
    title_en: parsed.title_en || '', title_fr: parsed.title_fr || '',
    title_rw: parsed.title_rw || '', summary_en: parsed.summary_en || '',
    summary_fr: parsed.summary_fr || '', summary_rw: parsed.summary_rw || '',
    content_en: parsed.content_en || '', content_fr: parsed.content_fr || '',
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
