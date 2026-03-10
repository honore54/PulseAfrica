import { supabaseAdmin } from '@/lib/supabase'
import { autoPostArticle } from '@/lib/twitterService'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

// This route runs every 30 minutes via Vercel cron
// It finds 1 unposted article and posts it to Twitter
export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = supabaseAdmin()

    // Find oldest unposted article
    const { data: articles, error } = await admin
      .from('articles')
      .select('id, slug, category, title_en, summary_en, location, image_url')
      .eq('tweeted', false)
      .order('published_at', { ascending: true })
      .limit(1)

    if (error) throw error

    if (!articles || articles.length === 0) {
      console.log('[TweetPoster] No unposted articles found')
      return Response.json({ success: true, message: 'No unposted articles' })
    }

    const article = articles[0]
    console.log(`[TweetPoster] Posting: "${article.title_en?.slice(0, 60)}"`)

    const result = await autoPostArticle(article)

    if (result.success) {
      // Mark as tweeted
      await admin
        .from('articles')
        .update({ tweeted: true, tweet_id: result.tweetId })
        .eq('id', article.id)

      console.log(`[TweetPoster] ✓ Posted tweet: ${result.tweetId}`)
    }

    return Response.json({
      success: true,
      article: article.slug,
      tweeted: result.success,
      tweetId: result.tweetId || null,
    })
  } catch (err) {
    console.error('[TweetPoster] Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}