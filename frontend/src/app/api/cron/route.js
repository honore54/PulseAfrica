import { waitUntil } from '@vercel/functions'
import { generateArticle, CATEGORIES } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const delay = ms => new Promise(r => setTimeout(r, ms))

async function generateForCategory(categoryId, admin) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const article = await generateArticle(categoryId)
      if (!article) continue

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
      if (attempt < 2) await delay(3000)
    }
  }
  console.log(`[CRON] ⛔ ${categoryId}: skipped`)
  return null
}

async function runGeneration() {
  const admin = supabaseAdmin()
  const uniqueArticles = []

  console.log('[CRON] Sequential generation starting...')

  // ── PURELY SEQUENTIAL — one category at a time ──────────
  // Each category finishes completely before next one starts
  // This prevents ALL Groq TPM collisions
  for (const cat of CATEGORIES) {
    try {
      console.log(`[CRON] Generating ${cat.label}...`)
      const article = await generateForCategory(cat.id, admin)
      if (article) uniqueArticles.push(article)
    } catch (err) {
      console.error(`[CRON] ✗ ${cat.id}: ${err.message}`)
    }
    // 8s gap between categories — TPM bucket fully refills
    await delay(8000)
  }

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

  console.log(`[CRON] ✅ Saved ${data.length}/6 to DB`)
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
    message: 'Sequential generation started',
    timestamp: new Date().toISOString(),
  })
}
