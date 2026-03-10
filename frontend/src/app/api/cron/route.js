import { generateAllCategories } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[CRON] Generating articles...')
    const articles = await generateAllCategories()

    const admin = supabaseAdmin()
    const { data, error } = await admin
      .from('articles')
      .insert(articles)
      .select('id, slug, category, title_en, summary_en, location, image_url')
    if (error) throw error
    console.log(`[CRON] Saved ${data.length} articles`)

    // Send each article to Make webhook
    const MAKE_WEBHOOK = process.env.MAKE_WEBHOOK_URL
    const results = []

    for (let i = 0; i < data.length; i++) {
      const article = { ...articles[i], ...data[i] }
      try {
        const res = await fetch(MAKE_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: article.title_en,
            summary: article.summary_en,
            category: article.category,
            location: article.location,
            slug: article.slug,
            url: `https://pulse-africa.vercel.app/article/${article.slug}`,
            image_url: article.image_url,
          })
        })
        console.log(`[Make] Sent article ${i+1}/6: ${article.title_en?.slice(0, 40)}`)
        results.push({ slug: article.slug, sent: true })
      } catch (err) {
        console.log(`[Make] Failed article ${i+1}: ${err.message}`)
        results.push({ slug: article.slug, sent: false })
      }

      // 5 second gap between each
      if (i < data.length - 1) {
        await new Promise(r => setTimeout(r, 5000))
      }
    }

    const sent = results.filter(r => r.sent).length
    console.log(`[CRON] ✓ Sent ${sent}/6 articles to Make`)

    return Response.json({
      success: true,
      generated: articles.length,
      articles: data.map(a => ({ id: a.id, slug: a.slug, category: a.category })),
      make: `Sent ${sent}/${articles.length} articles to Make webhook`,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[CRON] Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
