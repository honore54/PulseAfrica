import { generateArticle, CATEGORIES } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 55

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const cat = url.searchParams.get('cat')
  const admin = supabaseAdmin()

  // ── Single category mode ──────────────────────────────────
  if (cat) {
    const valid = CATEGORIES.find(c => c.id === cat)
    if (!valid) return Response.json({ error: `Unknown category: ${cat}` }, { status: 400 })

    console.log(`[CRON] Generating: ${cat}`)

    // Only 2 attempts to stay within 55s timeout
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const article = await generateArticle(cat)
        if (!article) continue

        const { data: existing } = await admin
          .from('articles').select('id')
          .ilike('title_en', `%${article.title_en.slice(0, 40)}%`)
          .limit(1)

        if (existing?.length > 0) {
          console.log(`[CRON] Duplicate — retrying`)
          continue
        }

        const { data, error } = await admin
          .from('articles')
          .insert([article])
          .select('id, slug, title_en, category')

        if (error) throw new Error(`DB: ${error.message}`)

        console.log(`[CRON] ✅ "${data[0].title_en}"`)
        return Response.json({
          success: true,
          category: cat,
          title: data[0].title_en,
          slug: data[0].slug,
        })

      } catch (err) {
        console.error(`[CRON] ✗ attempt ${attempt}: ${err.message?.slice(0, 120)}`)
      }
    }

    return Response.json({ success: false, category: cat, error: 'Failed' })
  }

  // ── All categories mode ───────────────────────────────────
  const results = []
  const failures = []

  for (const c of CATEGORIES) {
    try {
      const article = await generateArticle(c.id)
      if (!article) { failures.push(c.id); continue }

      const { data: existing } = await admin
        .from('articles').select('id')
        .ilike('title_en', `%${article.title_en.slice(0, 40)}%`)
        .limit(1)

      if (existing?.length > 0) { failures.push(c.id); continue }
      results.push(article)
    } catch (err) {
      console.error(`[CRON] ✗ ${c.id}: ${err.message}`)
      failures.push(c.id)
    }
  }

  if (results.length === 0) {
    return Response.json({ success: false, error: 'No articles generated', failures })
  }

  const { data, error } = await admin
    .from('articles').insert(results).select('id, slug, title_en, category')

  if (error) return Response.json({ success: false, error: error.message }, { status: 500 })

  return Response.json({
    success: true,
    generated: data.length,
    categories: data.map(a => `${a.category}: ${a.title_en?.slice(0, 40)}`),
    failures,
  })
}
