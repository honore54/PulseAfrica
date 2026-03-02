import { getArticles } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || null
  const lang     = searchParams.get('lang')     || 'en'
  const limit    = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const offset   = parseInt(searchParams.get('offset') || '0')

  try {
    const articles = await getArticles({ category, lang, limit, offset })
    return Response.json({ articles, total: articles.length })
  } catch (err) {
    console.error('[API /articles]', err)
    return Response.json({ articles: [], error: err.message }, { status: 500 })
  }
}
