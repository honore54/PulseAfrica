import { waitUntil } from '@vercel/functions'
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
  const text = [article.title_en||'',article.summary_en||'',article.content_en?.slice(0,300)||''].join(' ').toLowerCase()
  const matches = keywords.filter(kw => text.includes(kw))
  return matches.length >= 2
}

async function generateForCategory(categoryId, admin) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const article = await generateArticle(categoryId)
      if (!isArticleRelevant(article, categoryId)) {
        console.log(`[CRON] ✗ ${categoryId} not relevant — retry ${attempt}`)
        continue
      }
      const { data: existing } = await admin
        .from('articles').select('id')
        .ilike('title_en', `%${article.title_en.slice(0,40)}%`)
        .limit(1)
      if (existing?.length > 0) {
        console.log(`[CRON] ✗ ${categoryId} duplicate — retry ${attempt}`)
        continue
      }
      console.log(`[CRON] ✅ ${categoryId}: "${article.title_en.slice(0,60)}"`)
      return article
    } catch (err) {
      console.error(`[CRON] ✗ ${categoryId} attempt ${attempt}: ${err.message?.slice(0,80)}`)
    }
  }
  console.log(`[CRON] ⛔ ${categoryId}: skipped`)
  return null
}

async function runGeneration() {
  const admin = supabaseAdmin()

  // ── Run ALL 6 categories in PARALLEL — finishes in ~60s not 300s ──
  console.log('[CRON] Starting all 6 categories in parallel...')
  const results = await Promise.allSettled(
    CATEGORIES.map(cat => generateForCategory(cat.id, admin))
  )

  const uniqueArticles = results
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value)

  console.log(`[CRON] Generated ${uniqueArticles.length}/6 articles`)

  if (uniqueArticles.length === 0) {
    console.log('[CRON] No articles to save')
    return
  }

  const { data, error } = await admin
    .from('articles')
    .insert(uniqueArticles)
    .select('id, slug, title_en, category')

  if (error) { console.error('[CRON] DB error:', error.message); return }
  console.log(`[CRON] ✅ Saved ${data.length} articles to DB`)

  // Tweet each article
  for (let i = 0; i < data.length; i++) {
    const a = { ...uniqueArticles[i], ...data[i] }
    try {
      await postTweet(`${a.title_en} 🌍 https://pulse-africa.vercel.app/article/${a.slug} #Africa #News`)
      console.log(`[Twitter] ✓ ${a.title_en?.slice(0,40)}`)
    } catch (err) {
      console.log(`[Twitter] ✗ ${err.message?.slice(0,60)}`)
    }
    if (i < data.length - 1) await new Promise(r => setTimeout(r, 2000))
  }
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  waitUntil(runGeneration())
  return Response.json({ success: true, message: 'Generation started in parallel', timestamp: new Date().toISOString() })
}
