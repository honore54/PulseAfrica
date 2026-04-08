import { waitUntil } from '@vercel/functions'
import { generateArticle, CATEGORIES } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

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
        console.log(`[CRON] ✗ duplicate — retry ${attempt}`)
        continue
      }

      console.log(`[CRON] ✅ ${categoryId}: "${article.title_en.slice(0, 60)}"`)
      return article

    } catch (err) {
      console.error(`[CRON] ✗ attempt ${attempt}: ${err.message?.slice(0, 100)}`)
      if (attempt < 2) await delay(3000)
    }
  }
  return null
}

async function runSingle(categoryId) {
  const admin = supabaseAdmin()

  console.log(`[CRON] Generating single category: ${categoryId}`)

  const article = await generateForCategory(categoryId, admin)

  if (!article) {
    console.log(`[CRON] ✗ Failed to generate ${categoryId}`)
    return
  }

  const { data, error } = await admin
    .from('articles')
    .insert([article])
    .select('id, slug, title_en, category')

  if (error) { console.error('[CRON] DB error:', error.message); return }

  console.log(`[CRON] ✅ Saved: ${data[0]?.title_en?.slice(0, 60)}`)
}

async function runAll() {
  const admin = supabaseAdmin()
  const results = []

  for (const cat of CATEGORIES) {
    try {
      const article = await generateForCategory(cat.id, admin)
      if (article) results.push(article)
    } catch (err) {
      console.error(`[CRON] ✗ ${cat.id}: ${err.message}`)
    }
    await delay(3000)
  }

  if (results.length === 0) return

  const { data, error } = await admin
    .from('articles')
    .insert(results)
    .select('id, slug, title_en, category')

  if (error) { console.error('[CRON] DB error:', error.message); return }
  console.log(`[CRON] ✅ Saved ${data.length}/6 articles`)
  data.forEach(a => console.log(`  • ${a.category}: ${a.title_en?.slice(0, 50)}`))
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if specific category requested
  const url = new URL(request.url)
  const cat = url.searchParams.get('cat')

  if (cat) {
    // Single category mode — used by the 6 separate cron jobs
    const valid = CATEGORIES.find(c => c.id === cat)
    if (!valid) {
      return Response.json({ error: `Unknown category: ${cat}` }, { status: 400 })
    }
    console.log(`[CRON] Single category mode: ${cat}`)
    waitUntil(runSingle(cat))
    return Response.json({
      success: true,
      message: `Generating ${cat} article`,
      timestamp: new Date().toISOString(),
    })
  }

  // All categories mode — fallback for manual runs
  console.log(`[CRON] All categories mode`)
  waitUntil(runAll())
  return Response.json({
    success: true,
    message: 'Generating all categories',
    timestamp: new Date().toISOString(),
  })
}
