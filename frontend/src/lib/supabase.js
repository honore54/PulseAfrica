import { createClient } from '@supabase/supabase-js'

// ── Public client (for browser & server components) ───────
export function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  )
}

// ── Admin client (for API routes & cron — server only) ────
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  )
}

// ── Get articles with optional filters ────────────────────
export async function getArticles({ category = null, lang = 'en', limit = 20, offset = 0 } = {}) {
  const db = supabase()
  
  // Map language to column names
  const titleCol   = `title_${lang}`
  const summaryCol = `summary_${lang}`

  // Build the list of columns we want to read. We'll try including
  // `published_at` first (the schema expects it), but if the
  // database doesn't have that column we'll retry without it.
  const desiredCols = `id, slug, category, image_url, published_at, views, read_time, location, tags, ${titleCol}, ${summaryCol}`
  // A conservative fallback column list that avoids optional/dangerous columns
  // which might be missing in some environments (like read_time or published_at).
  const fallbackCols = `id, slug, category, image_url, views, location, tags, ${titleCol}, ${summaryCol}`

  // Helper to run a query given a select list and an optional order column
  const runQuery = async (selectCols, orderCol = null) => {
    let q = db.from('articles').select(selectCols)
    if (orderCol) q = q.order(orderCol, { ascending: false })
    q = q.range(offset, offset + limit - 1)
    if (category && category !== 'all') q = q.eq('category', category)
    return q
  }


  // First attempt: include published_at and order by it.
  let result = await runQuery(desiredCols, 'published_at')

  // If that fails, progressively fall back to smaller column sets so we
  // tolerate different database schema versions in developer environments.
  if (result.error) {
    // Try a conservative set that avoids optional fields like read_time/location.
    result = await runQuery(fallbackCols, 'created_at')
  }

  if (result.error) {
    // Minimal set: only id/slug and the language title/summary columns.
    const minimalCols = `id, slug, ${titleCol}, ${summaryCol}`
    result = await runQuery(minimalCols, 'created_at')
  }

  if (result.error) {
    // Very last-resort: id and slug only
    const idOnlyCols = `id, slug`
    result = await runQuery(idOnlyCols, null)
  }

  if (result.error) throw result.error

  const data = result.data || []

  // Normalise to consistent shape regardless of language and ensure
  // `published_at` exists so UI code calling `new Date(...)` or
  // `timeAgo(...)` doesn't crash. We prefer the real `published_at`,
  // then `created_at`, then a conservative fallback to now.
  return data.map(a => ({
    ...a,
    title:   a[titleCol]   || a.title_en   || '',
    summary: a[summaryCol] || a.summary_en || '',
    published_at: a.published_at || a.created_at || new Date().toISOString(),
  }))
}

// ── Get single article by slug ─────────────────────────────
export async function getArticleBySlug(slug, lang = 'en') {
  const db = supabase()

  const { data, error } = await db
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) throw new Error('Article not found')

  // Increment views (fire and forget)
  db.rpc('increment_views', { article_slug: slug }).catch(() => {})

  const titleKey   = `title_${lang}`
  const summaryKey = `summary_${lang}`
  const contentKey = `content_${lang}`

  return {
    ...data,
    title:   data[titleKey]   || data.title_en   || '',
    summary: data[summaryKey] || data.summary_en || '',
    content: data[contentKey] || data.content_en || '',
  }
}
