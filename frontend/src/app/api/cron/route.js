import { generateAllCategories } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

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
      .select('id, slug, category')

    console.log('[DB] Insert error:', JSON.stringify(error))
    console.log('[DB] Insert data:', JSON.stringify(data))

    if (error) throw error

    return Response.json({
      success: true,
      generated: articles.length,
      articles: data,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[CRON] Error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
