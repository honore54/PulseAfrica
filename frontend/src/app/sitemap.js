import { supabase } from '@/lib/supabase'
import { AUTHORS } from '@/lib/authors'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function sitemap() {
  const baseUrl = 'https://pulse-africa.vercel.app'

  const staticPages = [
    { url: baseUrl,                              lastModified: new Date(), changeFrequency: 'hourly',  priority: 1   },
    { url: `${baseUrl}/about`,                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`,                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`,                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/category/politics`,       lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${baseUrl}/category/sports`,         lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${baseUrl}/category/entertainment`,  lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${baseUrl}/category/africa`,         lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${baseUrl}/category/technology`,     lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${baseUrl}/category/business`,       lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
  ]

  // Author pages
  const authorPages = AUTHORS.map(a => ({
    url: `${baseUrl}/author/${a.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  // Dynamic article pages
  let articlePages = []
  try {
    const { data } = await supabase()
      .from('articles')
      .select('slug, published_at')
      .order('published_at', { ascending: false })
      .limit(500)

    articlePages = (data || []).map(a => ({
      url: `${baseUrl}/article/${a.slug}`,
      lastModified: new Date(a.published_at),
      changeFrequency: 'monthly',
      priority: 0.8,
    }))
  } catch {}

  return [...staticPages, ...authorPages, ...articlePages]
}