import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  // Secure with cron secret
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = supabaseAdmin()

  try {
    // Step 1: Get all articles ordered by published_at
    const { data: allArticles, error } = await admin
      .from('articles')
      .select('id, slug, title_en, published_at')
      .order('published_at', { ascending: true })

    if (error) throw error

    // Step 2: Find duplicates by title_en — keep the LATEST, delete the rest
    const seen = new Map()
    const toDelete = []

    for (const article of allArticles) {
      const title = (article.title_en || '').trim().toLowerCase()
      if (!title) continue

      if (seen.has(title)) {
        // Keep the newer one, delete the older one
        const existing = seen.get(title)
        toDelete.push(existing.id)
        seen.set(title, article) // replace with newer
      } else {
        seen.set(title, article)
      }
    }

    // Step 3: Also delete very old test articles (before March 7)
    const cutoff = '2026-03-07T00:00:00.000Z'
    const { data: oldArticles } = await admin
      .from('articles')
      .select('id, title_en, published_at')
      .lt('published_at', cutoff)

    const oldIds = (oldArticles || []).map(a => a.id)

    // Combine all IDs to delete
    const allToDelete = [...new Set([...toDelete, ...oldIds])]

    if (allToDelete.length === 0) {
      return Response.json({ success: true, deleted: 0, message: 'Nothing to clean up' })
    }

    // Step 4: Delete in batches of 50
    let totalDeleted = 0
    for (let i = 0; i < allToDelete.length; i += 50) {
      const batch = allToDelete.slice(i, i + 50)
      const { error: delError, count } = await admin
        .from('articles')
        .delete()
        .in('id', batch)
      if (delError) console.error('Delete error:', delError)
      else totalDeleted += batch.length
    }

    return Response.json({
      success: true,
      deleted: totalDeleted,
      duplicates_removed: toDelete.length,
      old_articles_removed: oldIds.length,
      message: `Cleaned up ${totalDeleted} articles`,
    })

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
