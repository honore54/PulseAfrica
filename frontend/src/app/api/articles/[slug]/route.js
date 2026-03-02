import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { slug } = params
  const { searchParams } = new URL(request.url)
  const lang = searchParams.get('lang') || 'en'

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error

    // Increment views async
    supabase.rpc('increment_views', { article_id: data.id }).catch(() => {})

    const t = lang === 'fr' ? 'fr' : lang === 'rw' ? 'rw' : 'en'
    return Response.json({
      ...data,
      title:   data[`title_${t}`]   || data.title_en,
      summary: data[`summary_${t}`] || data.summary_en,
      content: data[`content_${t}`] || data.content_en,
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
