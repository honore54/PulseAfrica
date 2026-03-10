import { generateAllCategories } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'
import { autoPostArticle } from '@/lib/twitterService'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Step 1 — Generate articles
    console.log('[CRON] Generating articles...')
    const articles = await generateAllCategories()

    // Step 2 — Save to DB
    const admin = supabaseAdmin()
    const { data, error } = await admin
      .from('articles')
      .insert(articles)
      .select('id, slug, category, title_en, summary_en, location, image_url')
    if (error) throw error
    console.log(`[CRON] Saved ${data.length} articles`)

    // Step 3 — Post all to Twitter with 15s gap
    const twitterResults = []
    for (let i = 0; i < data.length; i++) {
      const article = { ...articles[i], ...data[i] }
      console.log(`[Twitter] Posting ${i+1}/6: ${article.title_en?.slice(0, 50)}`)
      const result = await autoPostArticle(article)
      twitterResults.push(result)

      if (result.success) {
        await admin
          .from('articles')
          .update({ tweeted: true, tweet_id: result.tweetId })
          .eq('id', data[i].id)
      }

      // 15 second gap between tweets
      if (i < data.length - 1) {
        await new Promise(r => setTimeout(r, 15000))
      }
    }

    const posted = twitterResults.filter(r => r.success).length
    console.log(`[CRON] ✓ Done! Posted ${posted}/6 tweets`)

    return Response.json({
      success: true,
      generated: articles.length,
      articles: data.map(a => ({ id: a.id, slug: a.slug, category: a.category })),
      twitter: `Posted ${posted}/${articles.length} tweets`,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[CRON] Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
