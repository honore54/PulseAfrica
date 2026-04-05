import { generateArticle, CATEGORIES } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'
import { postTweet } from '@/lib/twitterService'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const CATEGORY_KEYWORDS = {
  politics: ['election','government','president','minister','parliament','senate','political','policy','diplomat','treaty','sanctions','coup','protest','opposition','democracy','vote','prime minister','congress','law','legislation','foreign','security','military','conflict','peace'],
  sports: ['football','soccer','basketball','tennis','rugby','cricket','athletics','match','game','tournament','transfer','player','club','league','coach','goal','score','champion','afcon','caf','fifa','nba','premier league','world cup','olympic','athlete','sport','boxing','medal','win','defeat'],
  entertainment: ['music','song','album','artist','singer','concert','tour','award','nollywood','film','movie','actor','actress','grammy','bet','afrobeats','amapiano','streaming','spotify','netflix','dance','festival','celebrity','entertainment','performance','release','chart','billboard'],
  africa: ['africa','african','continent','development','humanitarian','climate','health','education','infrastructure','aid','migration','diaspora','poverty','food','water','energy','agriculture','drought','flood','african union','au summit','imf','world bank','debt','relief'],
  technology: ['technology','tech','startup','fintech','app','software','digital','internet','mobile','ai','artificial intelligence','blockchain','crypto','cybersecurity','satellite','5g','innovation','coding','silicon','ecommerce','payment','data','cloud','robot','drone','electric'],
  business: ['business','economy','gdp','trade','investment','market','stock','finance','bank','currency','forex','inflation','revenue','profit','startup','funding','venture','commodity','oil','mining','agriculture','export','import','afcfta','loan','debt','budget','fiscal','monetary'],
}

function isArticleRelevant(article, categoryId) {
  const keywords = CATEGORY_KEYWORDS[categoryId] || []
  const text = [article.title_en || '', article.summary_en || '', article.content_en?.slice(0, 500) || ''].join(' ').toLowerCase()
  const matches = keywords.filter(kw => text.includes(kw))
  if (matches.length < 2) console.log(`[CRON] ⚠️ Category mismatch for ${categoryId}: ${matches.length} matches`)
  return matches.length >= 2
}

async function generateUniqueArticle(categoryId, admin, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const article = await generateArticle(categoryId)
      if (!isArticleRelevant(article, categoryId)) {
        console.log(`[CRON] ✗ Attempt ${attempt}: Not relevant to ${categoryId}`)
        continue
      }
      const { data: existing } = await admin
        .from('articles')
        .select('id')
        .ilike('title_en', `%${article.title_en.slice(0, 40)}%`)
        .limit(1)
      if (existing && existing.length > 0) {
        console.log(`[CRON] ✗ Attempt ${attempt}: Duplicate — retrying`)
        continue
      }
      console.log(`[CRON] ✓ "${article.title_en.slice(0, 60)}"`)
      return article
    } catch (err) {
      console.error(`[CRON] ✗ Attempt ${attempt} error: ${err.message}`)
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, attempt * 1000))
    }
  }
  return null
}

// ── Runs in background AFTER response is sent ─────────────
async function runGeneration() {
  const admin = supabaseAdmin()
  const uniqueArticles = []

  for (const cat of CATEGORIES) {
    try {
      console.log(`[CRON] Generating ${cat.label}...`)
      const article = await generateUniqueArticle(cat.id, admin, 3)
      if (article) {
        uniqueArticles.push(article)
        console.log(`[CRON] ✅ ${cat.label}: "${article.title_en.slice(0, 60)}"`)
      } else {
        console.log(`[CRON] ⛔ ${cat.label}: skipped`)
      }
    } catch (err) {
      console.error(`[CRON] ✗ Failed ${cat.id}: ${err.message}`)
    }
  }

  if (uniqueArticles.length === 0) {
    console.log('[CRON] No articles generated')
    return
  }

  const { data, error } = await admin
    .from('articles')
    .insert(uniqueArticles)
    .select('id, slug, title_en, category')

  if (error) { console.error('[CRON] DB insert error:', error.message); return }

  console.log(`[CRON] ✅ Inserted ${data.length}/6 articles into DB`)

  for (let i = 0; i < data.length; i++) {
    const a = { ...uniqueArticles[i], ...data[i] }
    try {
      const text = `${a.title_en} 🌍 https://pulse-africa.vercel.app/article/${a.slug} #Africa #News`
      await postTweet(text)
      console.log(`[Twitter] ✓ ${a.title_en?.slice(0, 40)}`)
    } catch (err) {
      console.log(`[Twitter] ✗ ${err.message}`)
    }
    if (i < data.length - 1) await new Promise(r => setTimeout(r, 3000))
  }
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── RESPOND IMMEDIATELY so cron-job.org gets 200 within 1s ──
  // Generation runs in background — Vercel keeps function alive
  // via maxDuration=300 even after response is sent
  runGeneration().catch(err => console.error('[CRON] Background error:', err))

  return Response.json({
    success: true,
    message: 'Generation started in background',
    timestamp: new Date().toISOString(),
  })
}
