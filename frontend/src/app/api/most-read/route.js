import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = supabaseAdmin()

    // Last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const { data, error } = await admin
      .from('articles')
      .select('id, slug, category, image_url, published_at, views, read_time, title_en, summary_en')
      .gte('published_at', yesterday.toISOString())
      .order('views', { ascending: false })
      .limit(5)

    if (error) throw error

    // Fallback: all-time most viewed
    if (!data || data.length === 0) {
      const { data: allTime } = await admin
        .from('articles')
        .select('id, slug, category, image_url, published_at, views, read_time, title_en, summary_en')
        .order('views', { ascending: false })
        .limit(5)
      return Response.json({ articles: allTime || [], period: 'all-time' })
    }

    return Response.json({ articles: data, period: '24h' })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
