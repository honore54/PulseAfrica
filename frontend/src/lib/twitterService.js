import crypto from 'crypto'

function generateOAuthHeader(method, url, consumerKey, consumerSecret, accessToken, accessTokenSecret) {
  const oauth = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
  }

  const params = Object.entries(oauth).sort(([a], [b]) => a.localeCompare(b))
  const paramStr = params.map(([k, v]) => `${encode(k)}=${encode(v)}`).join('&')
  const baseStr = `${method}&${encode(url)}&${encode(paramStr)}`
  const signingKey = `${encode(consumerSecret)}&${encode(accessTokenSecret)}`
  const signature = crypto.createHmac('sha1', signingKey).update(baseStr).digest('base64')

  oauth.oauth_signature = signature
  const headerParts = Object.entries(oauth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encode(k)}="${encode(v)}"`)
  return `OAuth ${headerParts.join(', ')}`
}

function encode(str) {
  return encodeURIComponent(String(str)).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
}

export async function postTweet(text) {
  const url = 'https://api.twitter.com/2/tweets'
  const method = 'POST'

  const authHeader = generateOAuthHeader(
    method, url,
    process.env.TWITTER_CONSUMER_KEY,
    process.env.TWITTER_CONSUMER_SECRET,
    process.env.TWITTER_ACCESS_TOKEN,
    process.env.TWITTER_ACCESS_TOKEN_SECRET
  )

  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(JSON.stringify(data))
  return data
}
