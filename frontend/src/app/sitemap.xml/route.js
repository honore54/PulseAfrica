import { supabase } from '@/lib/supabase'
import { AUTHORS } from '@/lib/authors'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = 'https://pulse-africa.vercel.app'
  const now = new Date().toISOString()

  const staticUrls = [
    { loc: baseUrl,                             lastmod: now, changefreq: 'hourly',  priority: '1.0' },
    { loc: `${baseUrl}/about`,                  lastmod: now, changefreq: 'monthly', priority: '0.6' },
    { loc: `${baseUrl}/contact`,                lastmod: now, changefreq: 'monthly', priority: '0.6' },
    { loc: `${baseUrl}/privacy`,                lastmod: now, changefreq: 'monthly', priority: '0.4' },
    { loc: `${baseUrl}/terms`,                  lastmod: now, changefreq: 'monthly', priority: '0.4' },
    { loc: `${baseUrl}/category/politics`,      lastmod: now, changefreq: 'hourly',  priority: '0.9' },
    { loc: `${baseUrl}/category/sports`,        lastmod: now, changefreq: 'hourly',  priority: '0.9' },
    { loc: `${baseUrl}/category/entertainment`, lastmod: now, changefreq: 'hourly',  priority: '0.9' },
    { loc: `${baseUrl}/category/africa`,        lastmod: now, changefreq: 'hourly',  priority: '0.9' },
    { loc: `${baseUrl}/category/technology`,    lastmod: now, changefreq: 'hourly',  priority: '0.9' },
    { loc: `${baseUrl}/category/business`,      lastmod: now, changefreq: 'hourly',  priority: '0.9' },
    ...AUTHORS.map(a => ({
      loc: `${baseUrl}/author/${a.id}`,
      lastmod: now,
      changefreq: 'daily',
      priority: '0.7',
    })),
  ]

  let articleUrls = []
  try {
    const { data } = await supabase()
      .from('articles')
      .select('slug, published_at')
      .order('published_at', { ascending: false })
      .limit(500)

    articleUrls = (data || []).map(a => ({
      // ── CRITICAL: Never include ?lang= in sitemap ──
      loc: `${baseUrl}/article/${a.slug}`,
      lastmod: new Date(a.published_at).toISOString(),
      changefreq: 'monthly',
      priority: '0.8',
    }))
  } catch {}

  const allUrls = [...staticUrls, ...articleUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-store',
    },
  })
}
