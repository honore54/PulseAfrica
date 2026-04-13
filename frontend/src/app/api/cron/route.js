async function isDuplicateInDB(title, admin) {
  try {
    // Extract 3 most unique words (over 4 chars) from title
    const words = title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(' ')
      .filter(w => w.length > 4)
      .slice(0, 3)

    if (words.length === 0) return false

    // Check each word combination against DB
    for (const word of words) {
      const { data } = await admin
        .from('articles')
        .select('id, title_en')
        .ilike('title_en', `%${word}%`)
        .limit(5)

      if (data && data.length > 0) {
        // Check if any result is truly similar (70%+ word overlap)
        for (const existing of data) {
          const existingWords = new Set(
            existing.title_en.toLowerCase()
              .replace(/[^a-z0-9 ]/g, ' ')
              .split(' ')
              .filter(w => w.length > 3)
          )
          const newWords = title.toLowerCase()
            .replace(/[^a-z0-9 ]/g, ' ')
            .split(' ')
            .filter(w => w.length > 3)
          
          const overlap = newWords.filter(w => existingWords.has(w)).length
          const similarity = overlap / Math.max(existingWords.size, newWords.length)
          
          if (similarity > 0.5) {
            console.log(`[CRON] Duplicate found: "${title.slice(0,50)}" matches "${existing.title_en.slice(0,50)}"`)
            return true
          }
        }
      }
    }
    return false
  } catch {
    return false
  }
}

import { generateArticle, CATEGORIES } from '@/lib/newsEngine'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const cat = url.searchParams.get('cat')
  const admin = supabaseAdmin()

  // ── Single category mode ──────────────────────────────
  if (cat) {
    const valid = CATEGORIES.find(c => c.id === cat)
    if (!valid) return Response.json({ error: `Unknown category: ${cat}` }, { status: 400 })

    console.log(`[CRON] Generating: ${cat}`)

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[CRON] Attempt ${attempt}/3`)
        const article = await generateArticle(cat)
        if (!article) continue

        const isDup = await isDuplicateInDB(article.title_en, admin)
        if (isDup) {
          console.log(`[CRON] Duplicate skipped: "${article.title_en.slice(0,50)}"`)
          continue
        }

        const { data, error } = await admin
          .from('articles')
          .insert([article])
          .select('id, slug, title_en, category')

        if (error) throw new Error(`DB: ${error.message}`)

        console.log(`[CRON] ✅ Saved: "${data[0].title_en}"`)
        return Response.json({
          success: true,
          category: cat,
          title: data[0].title_en,
          slug: data[0].slug,
        })

      } catch (err) {
        console.error(`[CRON] ✗ attempt ${attempt}: ${err.message}`)
        if (attempt < 3) await new Promise(r => setTimeout(r, 5000))
      }
    }

    return Response.json({ success: false, category: cat, error: 'Failed after 3 attempts' })
  }

  // ── All 6 categories mode ─────────────────────────────
  console.log(`[CRON] Generating all 6 categories`)
  const results = []
  const failures = []

  for (const c of CATEGORIES) {
    try {
      console.log(`[CRON] → ${c.id}`)
      const article = await generateArticle(c.id)
      if (!article) { failures.push(c.id); continue }

      const { data: existing } = await admin
        .from('articles').select('id')
        .ilike('title_en', `%${article.title_en.slice(0, 40)}%`)
        .limit(1)

      if (existing?.length > 0) {
        console.log(`[CRON] Duplicate: ${c.id}`)
        failures.push(c.id)
        continue
      }

      const { data, error } = await admin
        .from('articles')
        .insert([article])
        .select('id, slug, title_en, category')

      if (error) throw new Error(error.message)

      console.log(`[CRON] ✅ ${c.id}: "${data[0].title_en.slice(0, 50)}"`)
      results.push({ category: c.id, title: data[0].title_en })

      // Wait 65s between categories for Groq TPM reset
      if (c.id !== 'business') {
        console.log(`[CRON] Waiting 65s for Groq TPM reset...`)
        await new Promise(r => setTimeout(r, 65000))
      }

    } catch (err) {
      console.error(`[CRON] ✗ ${c.id}: ${err.message}`)
      failures.push(c.id)
    }
  }

  return Response.json({
    success: results.length > 0,
    generated: results.length,
    articles: results,
    failures,
  })
}
