import { waitUntil } from '@vercel/functions'
import { generateArticle, CATEGORIES } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

async function generateForCategory(categoryId, admin, delayMs = 0) {
  if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs))

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const article = await generateArticle(categoryId)

      // Only check for duplicates — no relevance filter
      const { data: existing } = await admin
        .from('articles').select('id')
        .ilike('title_en', `%${article.title_en.slice(0, 40)}%`)
        .limit(1)

      if (existing?.length > 0) {
        console.log(`[CRON] ✗ ${categoryId} duplicate — retry ${attempt}`)
        continue
      }

      console.log(`[CRON] ✅ ${categoryId}: "${article.title_en.slice(0, 60)}"`)
      return article

    } catch (err) {
      console.error(`[CRON] ✗ ${categoryId} attempt ${attempt}: ${err.message?.slice(0, 80)}`)
      if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 2000))
    }
  }
  console.log(`[CRON] ⛔ ${categoryId}: skipped`)
  return null
}

async function runGeneration() {
  const admin = supabaseAdmin()
  console.log('[CRON] Starting staggered generation...')

  const results = await Promise.allSettled([
    generateForCategory('politics',      admin, 0),
    generateForCategory('sports',        admin, 5000),
    generateForCategory('entertainment', admin, 10000),
    generateForCategory('africa',        admin, 15000),
    generateForCategory('technology',    admin, 20000),
    generateForCategory('business',      admin, 25000),
  ])

  const uniqueArticles = results
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value)

  console.log(`[CRON] Generated ${uniqueArticles.length}/6 articles`)

  if (uniqueArticles.length === 0) {
    console.log('[CRON] No articles generated')
    return
  }

  const { data, error } = await admin
    .from('articles')
    .insert(uniqueArticles)
    .select('id, slug, title_en, category')

  if (error) { console.error('[CRON] DB error:', error.message); return }

  console.log(`[CRON] ✅ Saved ${data.length}/6 articles to DB`)
  data.forEach(a => console.log(`  • ${a.category}: ${a.title_en?.slice(0, 60)}`))
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  waitUntil(runGeneration())
  return Response.json({
    success: true,
    message: 'Generation started',
    timestamp: new Date().toISOString(),
  })
}
