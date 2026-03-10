import { generateAllCategories } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'
import { autoPostAllArticles } from '@/lib/twitterService'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes — needed for image generation + posting

export async function GET(request) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[CRON] Starting article generation...')
    const articles = await generateAllCategories()
    console.log(`[CRON] Generated ${articles.length} articles`)

    const admin = supabaseAdmin()
    console.log('[DB] Attempting to insert', articles.length, 'articles')
    console.log('[DB] First article keys:', Object.keys(articles[0] || {}))

    const { data, error } = await admin
      .from('articles')
      .insert(articles)
      .select('id, slug, category, title_en, summary_en, location, image_url')

    console.log('[DB] Insert error:', JSON.stringify(error))
    console.log('[DB] Insert data:', JSON.stringify(data?.map(a => ({ id: a.id, slug: a.slug }))))

    if (error) throw error

    // ── Auto-post to Twitter after 1 minute delay ──────────
    console.log('[CRON] Articles saved! Starting Twitter auto-post in 1 minute...')

    // Fire and forget — don't block the cron response
    // We delay 60 seconds then post each article
    setTimeout(async () => {
      try {
        // Merge DB data (id, slug) with generated articles (title_en, summary_en etc)
        const articlesWithData = data.map((dbArticle, i) => ({
          ...articles[i],
          ...dbArticle,
        }))

        await autoPostAllArticles(articlesWithData)
      } catch (err) {
        console.error('[CRON] Twitter auto-post failed:', err.message)
      }
    }, 60 * 1000) // 1 minute delay

    return Response.json({
      success: true,
      generated: articles.length,
      articles: data.map(a => ({ id: a.id, slug: a.slug, category: a.category })),
      twitter: 'Auto-posting scheduled in 1 minute',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[CRON] Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}