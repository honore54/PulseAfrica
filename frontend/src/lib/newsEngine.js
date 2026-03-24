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

// ── African sports stars pool ─────────────────────────────
const AFRICAN_SPORTS_STARS = [
  'Victor Osimhen', 'Mohamed Salah', 'Sadio Mané', 'Riyad Mahrez',
  'Achraf Hakimi', 'Edouard Mendy', 'Kalidou Koulibaly', 'Thomas Partey',
  'André Onana', 'Nicolas Pépé', 'Hakim Ziyech', 'Wilfried Zaha',
  'Serge Gnabry', 'Chancel Mbemba', 'Naby Keïta', 'Idrissa Gueye',
  'Youssef En-Nesyri', 'Sofyan Amrabat', 'Sébastien Haller', 'Simon Adingra',
]

// ── African entertainment stars pool ─────────────────────
const AFRICAN_ENTERTAINMENT_STARS = [
  'Burna Boy', 'Wizkid', 'Davido', 'Tiwa Savage', 'Tems',
  'Rema', 'Asake', 'Ckay', 'Fireboy DML', 'Ayra Starr',
  'Diamond Platnumz', 'Harmonize', 'Zuchu', 'Sauti Sol',
  'Stonebwoy', 'Sarkodie', 'Black Sherif', 'Amapiano artists',
  'Master KG', 'Focalistic', 'Kabza De Small', 'DJ Maphorisa',
  'Nollywood', 'Genevieve Nnaji', 'Omotola Jalade', 'RMD',
  'Funke Akindele', 'Tobi Bakre', 'Ini Edo',
]

// ── Sports topics for variety ─────────────────────────────
const SPORTS_TOPICS = [
  { topic: 'transfer', query: 'African footballer transfer Premier League 2026' },
  { topic: 'afcon', query: 'AFCON Africa Cup of Nations 2026 qualification' },
  { topic: 'player_form', query: 'African player performance Champions League 2026' },
  { topic: 'world_cup', query: 'Africa 2026 FIFA World Cup squad preparation' },
  { topic: 'basketball', query: 'Africa Basketball League BAL 2026' },
  { topic: 'athletics', query: 'African athletics track field world record 2026' },
  { topic: 'boxing', query: 'African boxing champion title fight 2026' },
  { topic: 'rugby', query: 'Africa rugby union tournament 2026' },
  { topic: 'local_league', query: 'CAF Champions League African club football 2026' },
  { topic: 'injury_return', query: 'African footballer injury return 2026' },
]

// ── Entertainment topics for variety ─────────────────────
const ENTERTAINMENT_TOPICS = [
  { topic: 'new_album', query: 'African artist new album release 2026' },
  { topic: 'afrobeats', query: 'Afrobeats trending song chart 2026' },
  { topic: 'nollywood', query: 'Nollywood movie release box office 2026' },
  { topic: 'amapiano', query: 'Amapiano music South Africa trending 2026' },
  { topic: 'grammy', query: 'African artist Grammy Award nomination 2026' },
  { topic: 'concert', query: 'African music concert tour 2026' },
  { topic: 'collabo', query: 'African artist collaboration international 2026' },
  { topic: 'award_show', query: 'Africa Music Awards ceremony 2026' },
  { topic: 'streaming', query: 'African music Spotify Apple Music charts 2026' },
  { topic: 'film_festival', query: 'African film festival award cinema 2026' },
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

const GNEWS_QUERIES = {
  politics:      ['Africa election government 2026', 'African Union summit 2026', 'UN Africa diplomacy sanctions 2026'],
  africa:        ['Africa economy development 2026', 'African Union policy 2026', 'IMF World Bank Africa 2026'],
  technology:    ['Africa fintech startup 2026', 'Africa technology innovation 2026', 'SpaceX Starlink Africa 2026'],
  business:      ['Africa investment trade 2026', 'Africa economy GDP growth 2026', 'oil gas price Africa 2026'],
  sports:        [], // handled separately
  entertainment: [], // handled separately
}

const IMAGE_QUERY_EXAMPLES = {
  politics:      'parliament government officials podium Africa',
  sports:        'football stadium crowd cheering Africa',
  entertainment: 'african music concert stage performance',
  africa:        'african city skyline landscape nature',
  technology:    'african tech startup office laptop',
  business:      'african business meeting office cityscape',
}

async function fetchRealArticle(category) {
  if (!GNEWS_KEY) return null

  try {
    let selectedQuery

    if (category === 'sports') {
      // Pick random sports topic for variety
      const topic = SPORTS_TOPICS[Math.floor(Math.random() * SPORTS_TOPICS.length)]
      selectedQuery = topic.query
      console.log(`[GNews] Sports topic: "${topic.topic}" — "${selectedQuery}"`)
    } else if (category === 'entertainment') {
      // Pick random entertainment topic for variety
      const topic = ENTERTAINMENT_TOPICS[Math.floor(Math.random() * ENTERTAINMENT_TOPICS.length)]
      selectedQuery = topic.query
      console.log(`[GNews] Entertainment topic: "${topic.topic}" — "${selectedQuery}"`)
    } else {
      const rand = Math.random()
      const queries = GNEWS_QUERIES[category] || ['Africa news 2026']
      const queryIndex = rand < 0.35 ? 0 : rand < 0.70 ? 1 : 2
      selectedQuery = queries[queryIndex]
    }

    const q = encodeURIComponent(selectedQuery)
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=${q}&lang=en&max=10&in=title,description&apikey=${GNEWS_KEY}`,
      { next: { revalidate: 1800 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const articles = data.articles || []
    if (articles.length === 0) return null

    const article = articles[Math.floor(Math.random() * Math.min(articles.length, 5))]
    console.log(`[GNews] ✓ Got article for ${category}: "${article.title}"`)
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

// ── Sports-specific prompt ────────────────────────────────
function buildSportsPrompt(realArticle) {
  const star = AFRICAN_SPORTS_STARS[Math.floor(Math.random() * AFRICAN_SPORTS_STARS.length)]
  const country = pickCountry()

  if (realArticle) {
    return `You are a senior sports journalist at PulseAfrica, Africa's leading sports news platform. Reformat this REAL sports news article for our African audience.

REAL ARTICLE:
Title: ${realArticle.title}
Description: ${realArticle.description}
Content: ${realArticle.content}

STRICT RULES:
1. Use ONLY facts from the real article — never invent scores, transfer fees or quotes
2. Write with the energy and style of BBC Sport or ESPN — punchy, engaging, exciting
3. Include context about why this matters for African football/sports fans
4. Add relevant African sports context where appropriate
5. Make the headline clickable and SEO-optimized — include player name or competition name
6. Each language must feel native, not translated
7. Return ONLY valid JSON

SEO REQUIREMENTS:
- title_en must include: player name OR competition name + action word (signs, wins, beats, scores, transfers)
- tags must include: player names, club names, competition, country, "African football"
- seo_title: exactly 55-60 chars with main keyword first
- seo_desc: exactly 150-155 chars, include player/team name and action

Return this exact JSON:
{"title_en":"Punchy SEO headline with player/team name max 80 chars","title_fr":"Titre français accrocheur max 80 chars","title_rw":"Umutwe Kinyarwanda max 80 chars","summary_en":"2 exciting sentences about the story max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"Engaging sports article 350-450 words. ## 2-3 subheadings. Cover: what happened, player/team reaction, what it means for African football, what happens next. Use active voice. Real facts only.","content_fr":"Article sport français 280-320 mots. ## sous-titres. Mêmes faits.","content_rw":"Inkuru y'imikino Kinyarwanda 220-260 amagambo. ## interuro.","tags":["player_name","club_name","competition","country","african_football","sport_type"],"read_time":4,"location":"City, Country","image_query":"football player action stadium crowd","seo_title":"55-60 char SEO title with keyword first","seo_desc":"150-155 char meta description with player and action"}`
  }

  return `You are a senior sports journalist at PulseAfrica. Write a trending sports news article about African sports for 2026.

Choose ONE of these angles randomly:
- Transfer news: ${star} transfer rumor or completed deal
- Match report: African team winning important CAF or World Cup qualifier
- Player milestone: African player achieving record or award in European league
- Competition update: AFCON 2026 qualification standings
- Basketball: Basketball Africa League (BAL) 2026 update
- Athletics: African runner or field athlete breaking record

RULES:
1. Write about REAL ongoing situations in African sports in 2026
2. Use real known African players and real competitions — never invent fake statistics
3. Write with excitement and energy — make readers feel the moment
4. Make the SEO headline include a specific player name or competition
5. Return ONLY valid JSON

Return this exact JSON:
{"title_en":"Exciting sports headline with player/competition name max 80 chars","title_fr":"Titre sport français max 80 chars","title_rw":"Umutwe w'imikino Kinyarwanda max 80 chars","summary_en":"2 exciting sentences max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"Engaging 350-450 word sports article. ## 2-3 subheadings. Cover the news angle, African context, fan reaction, what happens next.","content_fr":"Article sport français 280-320 mots.","content_rw":"Inkuru y'imikino Kinyarwanda 220-260 amagambo.","tags":["player_name","competition","country","african_football","sport_type","club"],"read_time":4,"location":"City, ${country}","image_query":"african football player stadium action crowd","seo_title":"55-60 char SEO title","seo_desc":"150-155 char meta description"}`
}

// ── Entertainment-specific prompt ─────────────────────────
function buildEntertainmentPrompt(realArticle) {
  const star = AFRICAN_ENTERTAINMENT_STARS[Math.floor(Math.random() * AFRICAN_ENTERTAINMENT_STARS.length)]
  const country = pickCountry()

  if (realArticle) {
    return `You are a senior entertainment journalist at PulseAfrica, Africa's leading entertainment news platform. Reformat this REAL entertainment article for our African audience.

REAL ARTICLE:
Title: ${realArticle.title}
Description: ${realArticle.description}
Content: ${realArticle.content}

STRICT RULES:
1. Use ONLY facts from the real article
2. Write with the style of Billboard, Rolling Stone or OkayAfrica — vibrant, cultural, engaging
3. Connect the story to African music culture (Afrobeats, Amapiano, Nollywood etc.)
4. Make the headline include the artist name for maximum SEO value
5. Return ONLY valid JSON

SEO REQUIREMENTS:
- title_en must include: artist name + action (releases, drops, wins, announces, collaborates)
- tags: artist name, album/song name, genre, country, music platform
- seo_title: 55-60 chars with artist name first
- seo_desc: 150-155 chars mentioning artist and release/event

Return this exact JSON:
{"title_en":"Artist name + action headline max 80 chars","title_fr":"Titre entertainment français max 80 chars","title_rw":"Umutwe Kinyarwanda max 80 chars","summary_en":"2 exciting sentences about the story max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"Engaging entertainment article 350-450 words. ## 2-3 subheadings. Cover: what the artist released/did, fan reaction on social media, chart performance, African cultural significance, what comes next.","content_fr":"Article entertainment français 280-320 mots. ## sous-titres.","content_rw":"Inkuru y'abahanzi Kinyarwanda 220-260 amagambo. ## interuro.","tags":["artist_name","song_album_name","genre","country","afrobeats_or_nollywood","platform"],"read_time":4,"location":"City, Country","image_query":"african music concert performance stage lights","seo_title":"55-60 char SEO title with artist name first","seo_desc":"150-155 char meta description"}`
  }

  return `You are a senior entertainment journalist at PulseAfrica. Write a trending entertainment news article about African music and entertainment for 2026.

Choose ONE of these angles randomly:
- New music: ${star} drops new single or album — include fictional but realistic track name
- Award news: African artist wins or nominated for major award (BET, Grammy, MOBO)
- Concert/Tour: Major African artist announces African tour dates
- Nollywood: New blockbuster Nollywood film release or streaming on Netflix
- Collaboration: African artist collaborates with international star
- Chart success: African song breaks streaming records on Spotify/Apple Music
- Festival: Major African music festival announcement or highlights

RULES:
1. Write about realistic trending situations in African entertainment in 2026
2. Use real known African artists — make up realistic song/album titles only
3. Include social media fan reaction and streaming numbers for realism
4. Make content feel like it was written by a culture journalist who loves African music
5. Return ONLY valid JSON

Return this exact JSON:
{"title_en":"Artist name + action headline max 80 chars","title_fr":"Titre entertainment français max 80 chars","title_rw":"Umutwe Kinyarwanda max 80 chars","summary_en":"2 exciting sentences max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"Vibrant 350-450 word entertainment article. ## 2-3 subheadings. Artist background, what they released/did, fan reaction, streaming stats, cultural significance, what's next.","content_fr":"Article entertainment français 280-320 mots.","content_rw":"Inkuru y'abahanzi Kinyarwanda 220-260 amagambo.","tags":["artist_name","song_or_album","genre","country","afrobeats","streaming_platform"],"read_time":4,"location":"City, ${country}","image_query":"african music artist concert performance stage","seo_title":"55-60 char SEO title with artist name","seo_desc":"150-155 char meta description"}`
}

export async function generateArticle(category) {
  const catMeta = CATEGORIES.find(c => c.id === category) || CATEGORIES[0]
  const realArticle = await fetchRealArticle(category)

  let prompt

  if (category === 'sports') {
    prompt = buildSportsPrompt(realArticle)
  } else if (category === 'entertainment') {
    prompt = buildEntertainmentPrompt(realArticle)
  } else if (realArticle) {
    prompt = `You are PulseAfrica, Africa's trilingual news platform. Reformat and translate this REAL news article.

REAL ARTICLE FROM ${realArticle.source.toUpperCase()}:
Title: ${realArticle.title}
Description: ${realArticle.description}
Content: ${realArticle.content}

STRICT RULES:
1. Use ONLY facts from the real article — do NOT invent any facts
2. Professional rewrite in journalistic style
3. Each language must feel native
4. Return ONLY valid JSON
5. SEO: title must include main subject + location, tags must be specific

Return this exact JSON:
{"title_en":"SEO headline max 80 chars","title_fr":"Titre français max 80 chars","title_rw":"Umutwe Kinyarwanda max 80 chars","summary_en":"2-sentence summary max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"Professional 350-450 word article. ## 2-3 headings. Facts only.","content_fr":"Article français 280-320 mots. ## sous-titres.","content_rw":"Ingingo Kinyarwanda 220-260 amagambo. ## interuro.","tags":["specific_tag1","specific_tag2","country","topic","africa"],"read_time":4,"location":"City, Country","image_query":"specific 4-5 word Unsplash query","seo_title":"55-60 char SEO title with keyword first","seo_desc":"150-155 char meta description"}`
  } else {
    const country = pickCountry()
    const country2 = pickCountry()
    prompt = `You are PulseAfrica, Africa's news platform. Generate a realistic ${catMeta.label} news article about ${country} for 2026.

RULES:
1. Write about REAL ongoing situations in ${country} in 2026
2. Use real known leaders and officials — never invent fake names
3. Journalistic style — factual, grounded
4. Each language must feel native
5. Return ONLY valid JSON

Return this exact JSON:
{"title_en":"SEO headline max 80 chars","title_fr":"Titre français max 80 chars","title_rw":"Umutwe Kinyarwanda max 80 chars","summary_en":"2-sentence summary max 200 chars","summary_fr":"Résumé français 2 phrases","summary_rw":"Incamake Kinyarwanda interuro 2","content_en":"350-450 word article. ## 2-3 headings. Real facts only.","content_fr":"Article français 280-320 mots.","content_rw":"Ingingo Kinyarwanda 220-260 amagambo.","tags":["specific_tag1","country","topic","africa","category"],"read_time":4,"location":"City, ${country}","image_query":"specific 4-5 word query","seo_title":"55-60 char SEO title","seo_desc":"150-155 char meta description"}`
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
      temperature: 0.4,
      response_format: { type: 'json_object' }
    })
  })

  const json = await res.json()
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
      console.error(`[Engine] ✗ Failed ${cat.id}:`, err.message)
    }
  }
  return results
}
