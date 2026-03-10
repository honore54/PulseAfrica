import { generateAllCategories } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'
import { postTweet } from '@/lib/twitterService'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const articles = await generateAllCategories()
    const admin = supabaseAdmin()
    const { data, error } = await admin.from('articles').insert(articles).select('id, slug, title_en')
    if (error) throw error

    const results = []
    for (let i = 0; i < data.length; i++) {
      const a = { ...articles[i], ...data[i] }
      try {
        const text = `${a.title_en} 🌍 https://pulse-africa.vercel.app/article/${a.slug} #Africa #News`
        const tweet = await postTweet(text)
        console.log(`[Twitter] ✓ Posted: ${a.title_en?.slice(0, 40)}`)
        results.push({ slug: a.slug, posted: true, tweet_id: tweet.data?.id })
      } catch (err) {
        console.log(`[Twitter] ✗ Failed: ${err.message}`)
        results.push({ slug: a.slug, posted: false, error: err.message })
      }
      if (i < data.length - 1) await new Promise(r => setTimeout(r, 5000))
    }

    const posted = results.filter(r => r.posted).length
    return Response.json({ success: true, generated: data.length, tweeted: `${posted}/${data.length}`, results })
  } catch (err) {
    console.error('[CRON] Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
