import { generateArticle, CATEGORIES } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'
import { postTweet } from '@/lib/twitterService'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// ── Category keyword validation ───────────────────────────
const CATEGORY_KEYWORDS = {
  politics: [
    'election','government','president','minister','parliament','senate',
    'political','policy','diplomat','treaty','sanctions','coup','protest',
    'opposition','democracy','vote','prime minister','congress','law',
    'legislation','foreign','security','military','conflict','peace',
  ],
  sports: [
    'football','soccer','basketball','tennis','rugby','cricket','athletics',
    'match','game','tournament','transfer','player','club','league','coach',
    'goal','score','champion','afcon','caf','fifa','nba','premier league',
    'world cup','olympic','athlete','sport','boxing','medal','win','defeat',
  ],
  entertainment: [
    'music','song','album','artist','singer','concert','tour','award',
    'nollywood','film','movie','actor','actress','grammy','bet','afrobeats',
    'amapiano','streaming','spotify','netflix','dance','festival','celebrity',
    'entertainment','performance','release','chart','billboard','okayafrica',
  ],
  africa: [
    'africa','african','continent','development','humanitarian','climate',
    'health','education','infrastructure','aid','migration','diaspora',
    'poverty','food','water','energy','agriculture','drought','flood',
    'african union','au summit','imf','world bank','debt','relief',
  ],
  technology: [
    'technology','tech','startup','fintech','app','software','digital',
    'internet','mobile','ai','artificial intelligence','blockchain','crypto',
    'cybersecurity','satellite','5g','innovation','coding','silicon',
    'ecommerce','payment','data','cloud','robot','drone','electric',
  ],
  business: [
    'business','economy','gdp','trade','investment','market','stock',
    'finance','bank','currency','forex','inflation','revenue','profit',
    'startup','funding','venture','commodity','oil','mining','agriculture',
    'export','import','afcfta','loan','debt','budget','fiscal','monetary',
  ],
}

function isArticleRelevant(article, categoryId) {
  const keywords = CATEGORY_KEYWORDS[categoryId] || []
  const text = [
    article.title_en || '',
    article.summary_en || '',
    article.content_en?.slice(0, 500) || '',
  ].join(' ').toLowerCase()

  const matches = keywords.filter(kw => text.includes(kw))
  const isRelevant = matches.length >= 2

  if (!isRelevant) {
    console.log(`[CRON] ⚠️ Category mismatch for ${categoryId}: only ${matches.length} keyword matches (${matches.slice(0,3).join(', ')})`)
  }

  return isRelevant
}

async function generateUniqueArticle(categoryId, admin, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const article = await generateArticle(categoryId)

      // ── 1. Category relevance check ──
      if (!isArticleRelevant(article, categoryId)) {
        console.log(`[CRON] ✗ Attempt ${attempt}: Article not relevant to ${categoryId} — retrying...`)
        continue
      }

      // ── 2. Duplicate check in DB ──
      const { data: existing } = await admin
        .from('articles')
        .select('id')
        .ilike('title_en', `%${article.title_en.slice(0, 40)}%`)
        .limit(1)

      if (existing && existing.length > 0) {
        console.log(`[CRON] ✗ Attempt ${attempt}: Duplicate title "${article.title_en.slice(0,50)}" — retrying...`)
        await new Promise(r => setTimeout(r, 500))
        continue
      }

      console.log(`[CRON] ✓ Attempt ${attempt}: Relevant & unique — "${article.title_en.slice(0,60)}"`)
      return article

    } catch (err) {
      console.error(`[CRON] ✗ Attempt ${attempt} error for ${categoryId}: ${err.message}`)
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, attempt * 1000))
    }
  }

  console.log(`[CRON] ✗ Could not generate relevant unique article for ${categoryId} after ${maxRetries} attempts`)
  return null
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = supabaseAdmin()

    const uniqueArticles = []
    for (const cat of CATEGORIES) {
      try {
        console.log(`[CRON] Generating ${cat.label}...`)
        const article = await generateUniqueArticle(cat.id, admin, 5)
        if (article) {
          uniqueArticles.push(article)
          console.log(`[CRON] ✅ ${cat.label}: "${article.title_en.slice(0,60)}"`)
        } else {
          console.log(`[CRON] ⛔ ${cat.label}: skipped after all retries`)
        }
        await new Promise(r => setTimeout(r, 800))
      } catch (err) {
        console.error(`[CRON] ✗ Failed ${cat.id}:`, err.message)
      }
    }

    if (uniqueArticles.length === 0) {
      return Response.json({ success: false, message: 'No articles generated' })
    }

    const { data, error } = await admin
      .from('articles')
      .insert(uniqueArticles)
      .select('id, slug, title_en, category')

    if (error) throw error

    const results = []
    for (let i = 0; i < data.length; i++) {
      const a = { ...uniqueArticles[i], ...data[i] }
      try {
        const text = `${a.title_en} 🌍 https://pulse-africa.vercel.app/article/${a.slug} #Africa #News`
        const tweet = await postTweet(text)
        console.log(`[Twitter] ✓ Posted: ${a.title_en?.slice(0, 40)}`)
        results.push({ slug: a.slug, category: a.category, posted: true, tweet_id: tweet.data?.id })
      } catch (err) {
        console.log(`[Twitter] ✗ Failed: ${err.message}`)
        results.push({ slug: a.slug, category: a.category, posted: false, error: err.message })
      }
      if (i < data.length - 1) await new Promise(r => setTimeout(r, 5000))
    }

    const posted = results.filter(r => r.posted).length
    return Response.json({
      success: true,
      generated: data.length,
      categories: data.map(a => `${a.category}: ${a.title_en?.slice(0,40)}`),
      tweeted: `${posted}/${data.length}`,
      results
    })
  } catch (err) {
    console.error('[CRON] Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
