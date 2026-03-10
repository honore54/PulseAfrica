import { generateAllCategories } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'
import { autoPostArticle } from '@/lib/twitterService'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // Pro plan: 5 min. Free plan: 60s

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[CRON] Starting article generation...')
    const articles = await generateAllCategories()
    console.log(`[CRON] Generated ${articles.length} articles`)

    const admin = supabaseAdmin()
    const { data, error } = await admin
      .from('articles')
      .insert(articles)
      .select('id, slug, category, title_en, summary_en, location, image_url')

    if (error) throw error
    console.log(`[DB] Inserted ${data.length} articles`)

    // ── Post FIRST article to Twitter immediately ──────────
    // The remaining articles will be picked up by the tweet-poster
    // cron which runs every 30 minutes and posts unposted articles
    console.log('[Twitter] Posting first article now...')
    const firstArticle = { ...articles[0], ...data[0] }
    const tweetResult = await autoPostArticle(firstArticle)

    // ── Mark first article as tweeted in DB ───────────────
    if (tweetResult.success) {
      await admin
        .from('articles')
        .update({ tweeted: true, tweet_id: tweetResult.tweetId })
        .eq('id', data[0].id)
      console.log(`[Twitter] ✓ First tweet posted: ${tweetResult.tweetId}`)
    }

    return Response.json({
      success: true,
      generated: articles.length,
      articles: data.map(a => ({ id: a.id, slug: a.slug, category: a.category })),
      twitter: tweetResult.success ? `First tweet posted: ${tweetResult.tweetId}` : 'First tweet failed',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[CRON] Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}