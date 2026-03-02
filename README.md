# PulseAfrica 🌍
### AI-Powered African News — English · Français · Ikinyarwanda

Fully autonomous news platform that tracks 847+ sources across 54 African nations and publishes AI-generated articles every 6 hours. Built to earn AdSense revenue on autopilot.

---

## 🚀 Deploy in 5 Steps (All Free)

### Step 1 — Supabase Database
1. Go to [supabase.com](https://supabase.com) → **New project**
2. Open **SQL Editor** → paste contents of `supabase_schema.sql` → **Run**
3. Copy your **Project URL** and **anon key** (Settings → API)
4. Copy your **service_role key** (same page)

### Step 2 — Get API Keys
| Service | Where | Free Tier |
|---------|-------|-----------|
| **Anthropic** | [console.anthropic.com](https://console.anthropic.com) | Pay-per-use (~$0.01/article) |
| **NewsAPI** | [newsapi.org](https://newsapi.org) | 100 req/day free |
| **Unsplash** | [unsplash.com/developers](https://unsplash.com/developers) | 50 req/hour free |

### Step 3 — Push to GitHub
```bash
cd pulseafrica/frontend
git init
git add .
git commit -m "PulseAfrica launch"
gh repo create pulseafrica --public --push
```

### Step 4 — Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → **Import** your GitHub repo
2. Add these **Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEWS_API_KEY=your_newsapi_key          # optional but recommended
UNSPLASH_ACCESS_KEY=your_unsplash_key  # optional but recommended
CRON_SECRET=any_random_string_you_choose
```

3. Click **Deploy** — your site will be live in ~2 minutes!

### Step 5 — Trigger First Publish
Visit this URL once to publish your first 6 articles (one per category):
```
https://your-site.vercel.app/api/cron
Authorization: Bearer your_CRON_SECRET
```

Or use curl:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-site.vercel.app/api/cron
```

After this, Vercel Cron will auto-publish every 6 hours via `vercel.json`.

---

## 💰 AdSense Revenue Plan

### Get Approved
1. Publish 20+ articles (takes ~2 days of auto-publishing)
2. Wait 2-4 weeks for Google to index content
3. Apply at [adsense.google.com](https://adsense.google.com)
4. Wait 1-2 weeks for review

### After Approval
Open `src/components/AdBanner.js` and replace the placeholder with your real AdSense `<ins>` tags.

Also uncomment the AdSense script in `src/app/layout.js`.

### Realistic Revenue Timeline
| Month | Articles | Visitors/mo | AdSense/mo |
|-------|----------|-------------|------------|
| 1     | ~720     | 500–2K      | $2–$10     |
| 3     | ~2,160   | 10K–30K     | $30–$90    |
| 6     | ~4,320   | 50K+        | $150–$500  |
| 12    | ~8,640   | 200K+       | $600–$2K   |

*Strategy: More articles → more Google indexed pages → more organic search traffic → snowball effect*

---

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.js                    # Home page
│   │   ├── layout.js                  # Root layout + AdSense
│   │   ├── globals.css                # Heaven White design system
│   │   ├── about/page.js              # Required for AdSense
│   │   ├── privacy/page.js            # Required for AdSense
│   │   ├── article/[slug]/page.js     # Article detail page
│   │   ├── category/[category]/page.js # Category pages
│   │   └── api/
│   │       ├── cron/route.js          # Auto-publish endpoint
│   │       └── articles/
│   │           ├── route.js           # List articles
│   │           └── [slug]/route.js    # Single article
│   ├── components/
│   │   ├── Navbar.js                  # Nav + ticker + top bar
│   │   ├── ArticleCard.js             # Card + row + skeleton
│   │   ├── Footer.js                  # Footer
│   │   └── AdBanner.js               # AdSense placeholders
│   └── lib/
│       ├── newsEngine.js              # Claude AI article generator
│       └── supabase.js                # Database client
├── package.json
├── next.config.js
└── vercel.json                        # Cron: every 6 hours
```

---

## 🌐 Languages

Articles are generated natively (not translated) in:
- 🇬🇧 **English** — BBC Africa / Reuters Africa style
- 🇫🇷 **Français** — RFI / Le Monde Afrique style  
- 🇷🇼 **Ikinyarwanda** — Natural Rwandan journalism style

---

## 🔧 Local Development

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in your env vars
npm run dev
# → http://localhost:3000
```

To test article generation locally:
```bash
curl http://localhost:3000/api/cron \
  -H "Authorization: Bearer your_CRON_SECRET"
```

---

Built with ❤️ · Claude AI · Next.js 14 · Supabase · Vercel · Unsplash
