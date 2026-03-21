import { generateArticle, CATEGORIES } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'
import { postTweet } from '@/lib/twitterService'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

async function generateUniqueArticle(categoryId, admin, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const article = await generateArticle(categoryId)

    // Check if title already exists
    const { data: existing } = await admin
      .from('articles')
      .select('id')
      .ilike('title_en', `%${article.title_en.slice(0, 40)}%`)
      .limit(1)

    if (!existing || existing.length === 0) {
      console.log(`[CRON] ✓ Unique article on attempt ${attempt}: "${article.title_en}"`)
      return article
    }

    console.log(`[CRON] ⚠️ Duplicate on attempt ${attempt}: "${article.title_en}" — retrying...`)
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`[CRON] ✗ Could not generate unique article for ${categoryId} after ${maxRetries} attempts`)
  return null
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = supabaseAdmin()

    // Generate one unique article per category with retry logic
    const uniqueArticles = []
    for (const cat of CATEGORIES) {
      try {
        console.log(`[CRON] Generating ${cat.label}...`)
        const article = await generateUniqueArticle(cat.id, admin, 3)
        if (article) {
          uniqueArticles.push(article)
        }
        await new Promise(r => setTimeout(r, 800))
      } catch (err) {
        console.error(`[CRON] ✗ Failed ${cat.id}:`, err.message)
      }
    }

    if (uniqueArticles.length === 0) {
      return Response.json({ success: false, message: 'No unique articles could be generated' })
    }

    const { data, error } = await admin
      .from('articles')
      .insert(uniqueArticles)
      .select('id, slug, title_en')

    if (error) throw error

    const results = []
    for (let i = 0; i < data.length; i++) {
      const a = { ...uniqueArticles[i], ...data[i] }
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
    return Response.json({
      success: true,
      generated: data.length,
      tweeted: `${posted}/${data.length}`,
      results
    })
  } catch (err) {
    console.error('[CRON] Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
