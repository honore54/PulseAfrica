import { supabase } from '@/lib/supabase'

export default async function sitemap() {
  const baseUrl = 'https://pulse-africa.vercel.app'

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/category/politics`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/category/sports`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/category/entertainment`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/category/africa`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/category/technology`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/category/business`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  ]

  // Dynamic article pages
  let articlePages = []
  try {
    const { data } = await supabase()
      .from('articles')
      .select('slug, published_at')
      .order('published_at', { ascending: false })
      .limit(200)

    articlePages = (data || []).map(a => ({
      url: `${baseUrl}/article/${a.slug}`,
      lastModified: new Date(a.published_at),
      changeFrequency: 'monthly',
      priority: 0.8,
    }))
  } catch {}

  return [...staticPages, ...articlePages]
}