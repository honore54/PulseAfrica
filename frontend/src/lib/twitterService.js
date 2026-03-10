// ── Twitter/X Auto-Post Service for PulseAfrica ──────────
// Generates image with Gemini, writes SEO caption, posts to Twitter

const GEMINI_KEY = process.env.GEMINI_API_KEY
const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET

// ── OAuth 1.0a signature for Twitter ─────────────────────
function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret) {
  const sortedParams = Object.keys(params).sort().map(key =>
    `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
  ).join('&')

  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams)
  ].join('&')

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`

  // Use crypto for HMAC-SHA1
  const crypto = require('crypto')
  return crypto.createHmac('sha256', signingKey).update(baseString).digest('base64')
}

function generateOAuthHeader(method, url, extraParams = {}) {
  const oauthParams = {
    oauth_consumer_key: TWITTER_CONSUMER_KEY,
    oauth_nonce: Math.random().toString(36).substring(2) + Date.now().toString(36),
    oauth_signature_method: 'HMAC-SHA256',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: TWITTER_ACCESS_TOKEN,
    oauth_version: '1.0',
    ...extraParams,
  }

  const allParams = { ...oauthParams, ...extraParams }
  const signature = generateOAuthSignature(
    method, url, allParams,
    TWITTER_CONSUMER_SECRET,
    TWITTER_ACCESS_TOKEN_SECRET
  )

  oauthParams.oauth_signature = signature

  const headerParts = Object.keys(oauthParams).sort().map(key =>
    `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`
  )

  return `OAuth ${headerParts.join(', ')}`
}

// ── Generate SEO Twitter caption using Groq ───────────────
async function generateTwitterCaption(article) {
  const GROQ_KEY = process.env.GROQ_API_KEY

  const categoryEmojis = {
    politics: '🏛️',
    sports: '⚽',
    entertainment: '🎬',
    africa: '🌍',
    technology: '💻',
    business: '📈',
  }

  const emoji = categoryEmojis[article.category] || '🌍'

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `Write a punchy, eye-catching Twitter/X post for this African news article.

Article Title: ${article.title_en}
Article Summary: ${article.summary_en}
Category: ${article.category}
Location: ${article.location}
Article URL: https://pulse-africa.vercel.app/article/${article.slug}

STRICT RULES:
1. Maximum 220 characters total including URL and hashtags
2. Start with ${emoji} and a powerful hook line
3. Include the article URL
4. End with 3-4 highly relevant hashtags including #Africa and #PulseAfrica
5. Make it feel urgent, breaking, and eye-catching
6. No quotes around the text
7. Return ONLY the tweet text — nothing else

Example format:
${emoji} BREAKING — [hook]

[1-2 key facts]

👉 [URL]

#Africa #PulseAfrica #[relevant] #[relevant]`
        }],
        max_tokens: 300,
        temperature: 0.8,
      })
    })

    const data = await res.json()
    const caption = data.choices?.[0]?.message?.content?.trim() || ''
    console.log(`[Twitter] Generated caption: ${caption.slice(0, 100)}...`)
    return caption
  } catch (err) {
    console.log('[Twitter] Caption generation failed, using fallback')
    // Fallback caption
    return `${emoji} ${article.title_en}\n\n${article.summary_en?.slice(0, 100)}\n\n👉 https://pulse-africa.vercel.app/article/${article.slug}\n\n#Africa #PulseAfrica #AfricaNews`
  }
}

// ── Generate image prompt for Gemini ─────────────────────
function buildImagePrompt(article) {
  const categoryStyles = {
    politics: 'government parliament officials political rally, dark blue and gold tones, serious editorial style',
    sports: 'sports stadium crowd cheering athletes victory, vibrant energetic colors, championship atmosphere',
    entertainment: 'music concert stage colorful lights performance, vibrant purple and gold, entertainment aesthetic',
    africa: 'african city skyline landscape nature development, warm golden tones, hopeful atmosphere',
    technology: 'modern tech office startup laptop coding innovation, blue green futuristic colors, digital aesthetic',
    business: 'business meeting office cityscape financial growth, professional navy and gold tones',
  }

  const style = categoryStyles[article.category] || categoryStyles.africa

  return `Create a professional news article social media image for Twitter/X.

Topic: ${article.title_en}
Location: ${article.location}
Visual style: ${style}

Requirements:
- Landscape format 1200x675px
- Dark overlay at bottom with bold white text: "${article.title_en.slice(0, 50)}"
- Small gold text bottom right: "pulse-africa.vercel.app"
- No human faces
- Cinematic dramatic lighting
- Professional news editorial aesthetic
- African context where possible`
}

// ── Generate image using Gemini ───────────────────────────
async function generateImageWithGemini(article) {
  if (!GEMINI_KEY) {
    console.log('[Gemini] No API key found')
    return null
  }

  try {
    const prompt = buildImagePrompt(article)

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE']
          }
        })
      }
    )

    if (!res.ok) {
      console.log(`[Gemini] HTTP error ${res.status}`)
      return null
    }

    const data = await res.json()
    const parts = data.candidates?.[0]?.content?.parts || []

    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith('image/')) {
        console.log('[Gemini] ✓ Image generated successfully')
        return {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        }
      }
    }

    console.log('[Gemini] No image in response')
    return null
  } catch (err) {
    console.log('[Gemini] Image generation failed:', err.message)
    return null
  }
}

// ── Upload image to Twitter ───────────────────────────────
async function uploadImageToTwitter(imageBase64, mimeType) {
  try {
    const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json'
    const oauthHeader = generateOAuthHeader('POST', uploadUrl)

    const formData = new FormData()
    const imageBuffer = Buffer.from(imageBase64, 'base64')
    const blob = new Blob([imageBuffer], { type: mimeType })
    formData.append('media', blob)
    formData.append('media_category', 'tweet_image')

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: { Authorization: oauthHeader },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.text()
      console.log('[Twitter] Image upload failed:', err)
      return null
    }

    const data = await res.json()
    console.log('[Twitter] ✓ Image uploaded, media_id:', data.media_id_string)
    return data.media_id_string
  } catch (err) {
    console.log('[Twitter] Image upload error:', err.message)
    return null
  }
}

// ── Post tweet ────────────────────────────────────────────
async function postTweet(caption, mediaId = null) {
  try {
    const tweetUrl = 'https://api.twitter.com/2/tweets'
    const oauthHeader = generateOAuthHeader('POST', tweetUrl)

    const body = { text: caption }
    if (mediaId) {
      body.media = { media_ids: [mediaId] }
    }

    const res = await fetch(tweetUrl, {
      method: 'POST',
      headers: {
        Authorization: oauthHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      console.log('[Twitter] Post failed:', err)
      return null
    }

    const data = await res.json()
    const tweetId = data.data?.id
    console.log(`[Twitter] ✓ Tweet posted! ID: ${tweetId}`)
    return tweetId
  } catch (err) {
    console.log('[Twitter] Post error:', err.message)
    return null
  }
}

// ── Main: Auto-post one article to Twitter ────────────────
export async function autoPostArticle(article) {
  console.log(`[AutoPost] Processing: "${article.title_en?.slice(0, 60)}"`)

  try {
    // Step 1 — Generate SEO caption
    const caption = await generateTwitterCaption(article)

    // Step 2 — Generate image with Gemini
    const image = await generateImageWithGemini(article)

    // Step 3 — Upload image to Twitter if generated
    let mediaId = null
    if (image) {
      mediaId = await uploadImageToTwitter(image.data, image.mimeType)
    }

    // Step 4 — Post tweet
    const tweetId = await postTweet(caption, mediaId)

    if (tweetId) {
      console.log(`[AutoPost] ✓ Successfully posted article: ${article.slug}`)
      return { success: true, tweetId, slug: article.slug }
    } else {
      console.log(`[AutoPost] ✗ Failed to post article: ${article.slug}`)
      return { success: false, slug: article.slug }
    }
  } catch (err) {
    console.log(`[AutoPost] Error for ${article.slug}:`, err.message)
    return { success: false, slug: article.slug, error: err.message }
  }
}

// ── Post all articles with 1 min delay between each ───────
export async function autoPostAllArticles(articles) {
  console.log(`[AutoPost] Starting auto-post for ${articles.length} articles...`)
  const results = []

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]

    // Wait 2 minutes between each tweet to avoid rate limits
    if (i > 0) {
      console.log(`[AutoPost] Waiting 2 minutes before next tweet...`)
      await new Promise(r => setTimeout(r, 2 * 60 * 1000))
    }

    const result = await autoPostArticle(article)
    results.push(result)
  }

  const succeeded = results.filter(r => r.success).length
  console.log(`[AutoPost] ✓ Posted ${succeeded}/${articles.length} tweets`)
  return results
}