import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────
//  CONSTANTS & CONFIG
// ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",           label: "All News",      emoji: "🌐", color: "#1a56db" },
  { id: "politics",      label: "Politics",      emoji: "🏛️", color: "#c81240", light: "#fff5f8", border: "rgba(200,18,64,.14)"  },
  { id: "sports",        label: "Sports",        emoji: "⚽", color: "#0a8f6c", light: "#f0fdf9", border: "rgba(10,143,108,.14)" },
  { id: "entertainment", label: "Entertainment", emoji: "🎬", color: "#6d28d9", light: "#f3f0ff", border: "rgba(109,40,217,.14)" },
  { id: "africa",        label: "Africa",        emoji: "🌍", color: "#c45e00", light: "#fff6f0", border: "rgba(196,94,0,.14)"   },
  { id: "technology",    label: "Technology",    emoji: "💻", color: "#1a56db", light: "#eff5ff", border: "rgba(26,86,219,.14)"  },
  { id: "business",      label: "Business",      emoji: "📈", color: "#b07900", light: "#fffae8", border: "rgba(176,121,0,.14)"  },
];

// Curated Unsplash image pools per category — vivid, Africa-relevant
const IMAGES = {
  politics:      ["1569025743873-ea3a9ade89f9","1529107386315-e1a2ed48a620","1541872703-74c5e44368f9","1509099836639-18ba1795216d","1521587760476-6c12a4b040da"],
  sports:        ["1551698618-1dfe5d97d256","1508739773434-c26b3d09e071","1540747913346-19212a4b3993","1594737625785-a6cbdabd333c","1574629810360-7efbbe195018"],
  entertainment: ["1493225457124-a3eb161ffa5f","1511671782779-c97d3d27a1d4","1483695028939-5bb13f8648b0","1459749411175-04bf5292ceea","1516450360452-9312f5e86fc7"],
  africa:        ["1509099836639-18ba1795216d","1489392191049-fc10c97e64b9","1523805009345-7448845a9e53","1547471080-7cc2caa01a7e","1569025690938-a00729c9e1f9"],
  technology:    ["1518770660439-4636190af475","1639762681485-074b7f938ba0","1485827404703-89b55fcc595e","1518770660439-4636190af475","1461749280684-dccba630e2f6"],
  business:      ["1611974789855-9c2a0a7236a3","1579621970563-ebec7221a9a4","1454165804606-c3d57bc86b40","1486406146926-c627a92ad1ab","1507003211169-0a1dd7228f2d"],
};

const UNSPLASH = (id, w = 800, h = 500) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

const randImg = (cat) => {
  const pool = IMAGES[cat] || IMAGES.africa;
  return UNSPLASH(pool[Math.floor(Math.random() * pool.length)]);
};

// ─────────────────────────────────────────────────────────
//  AI ARTICLE GENERATION
// ─────────────────────────────────────────────────────────
async function generateArticle(category, lang = "en") {
  const cat = CATEGORIES.find((c) => c.id === category) || CATEGORIES[1];

  const langInstructions = {
    en: "Write entirely in English. Professional, authoritative, like BBC Africa.",
    fr: "Écris entièrement en français. Professionnel, comme RFI ou Le Monde Afrique.",
    rw: "Andika yose mu Kinyarwanda. Ikinyarwanda cy'ikiremwa, nk'umunyamakuru w'inzobere.",
  };

  const prompt = `You are PulseAfrica, Africa's premier AI news publication. Generate a compelling, real-feeling news article about a trending topic in the "${cat.label}" category relevant to Africa today.

Language instruction: ${langInstructions[lang]}

Respond ONLY with valid JSON — no markdown, no code fences, no extra text:
{
  "title": "Compelling headline (max 80 chars, SEO-optimized)",
  "summary": "Engaging 2-sentence summary that makes people want to read more",
  "body": "Full article body (400-600 words). Use ## for subheadings. Write with depth, African context, expert perspective, real-feeling quotes from sources. Make it feel like real breaking news.",
  "tags": ["tag1","tag2","tag3","tag4"],
  "readTime": 4,
  "location": "City, Country (e.g. Kigali, Rwanda)",
  "imageQuery": "3-word descriptive image search phrase"
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const text = data.content?.map((b) => b.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  return {
    id: Date.now() + Math.random(),
    category,
    lang,
    image: randImg(category),
    publishedAt: new Date(),
    views: Math.floor(Math.random() * 30000) + 1000,
    ...parsed,
  };
}

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const fmtViews = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n);

const catMeta = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[1];

// ─────────────────────────────────────────────────────────
//  CSS STRINGS — heaven white design
// ─────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=Space+Mono:wght@400;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{
  background:#fff;color:#0c1a3a;
  font-family:'DM Sans',sans-serif;
  overflow-x:hidden;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='.015'/%3E%3C/svg%3E");
}

/* Heaven light layers */
.heaven{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
.h-apex{position:absolute;top:-30%;left:50%;transform:translateX(-50%);width:180%;height:90%;background:radial-gradient(ellipse at 50% 5%,rgba(210,228,255,.75) 0%,rgba(230,240,255,.45) 22%,rgba(245,250,255,.2) 48%,transparent 72%);}
.h-amber{position:absolute;bottom:-15%;left:-8%;width:65%;height:65%;background:radial-gradient(ellipse,rgba(255,236,175,.4) 0%,rgba(255,248,210,.2) 40%,transparent 70%);animation:hd 16s ease-in-out infinite;}
.h-azure{position:absolute;top:15%;right:-12%;width:55%;height:55%;background:radial-gradient(ellipse,rgba(185,215,255,.3) 0%,rgba(215,233,255,.12) 45%,transparent 70%);animation:hd 20s ease-in-out infinite reverse;}
.h-rose{position:absolute;top:42%;left:30%;width:48%;height:38%;background:radial-gradient(ellipse,rgba(255,215,228,.12) 0%,transparent 65%);animation:hd 24s ease-in-out infinite 4s;}
.h-jade{position:absolute;bottom:5%;right:8%;width:40%;height:35%;background:radial-gradient(ellipse,rgba(190,245,225,.12) 0%,transparent 65%);animation:hd 18s ease-in-out infinite 8s reverse;}
@keyframes hd{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(18px,-26px) scale(1.05)}66%{transform:translate(-12px,13px) scale(.96)}}

@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes shineSwipe{0%{left:-100%}100%{left:200%}}
@keyframes skeletonGlow{0%,100%{opacity:.5}50%{opacity:1}}

/* TOP BAR */
.topbar{background:#f3f6ff;border-bottom:1px solid #e6ecff;padding:7px 40px;display:flex;align-items:center;justify-content:space-between;font-family:'Space Mono';font-size:9px;color:#8d9dbe;letter-spacing:2px;position:relative;z-index:50;}
.live-badge{display:flex;align-items:center;gap:7px;background:#f0fdf9;border:1px solid #e0faf3;padding:3px 10px;border-radius:100px;color:#0a8f6c;font-size:9px;}
.live-dot{width:5px;height:5px;border-radius:50%;background:#2db891;box-shadow:0 0 8px #92e5cc;animation:pulse 2s infinite;}

/* NAV */
.nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.9);backdrop-filter:blur(40px) saturate(1.6);-webkit-backdrop-filter:blur(40px) saturate(1.6);border-bottom:1px solid #e6ecff;box-shadow:0 1px 0 #fff,0 4px 24px rgba(12,26,58,.04);}
.nav-inner{max-width:1380px;margin:0 auto;display:flex;align-items:center;height:64px;padding:0 40px;}
.logo{display:flex;align-items:center;gap:11px;text-decoration:none;margin-right:48px;flex-shrink:0;cursor:pointer;}
.logo-mark{width:36px;height:36px;border-radius:10px;background:linear-gradient(145deg,#1e2d52,#0c1a3a);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(12,26,58,.2),inset 0 1px 0 rgba(255,255,255,.1);flex-shrink:0;position:relative;overflow:hidden;}
.logo-mark::after{content:'';position:absolute;top:0;left:-80%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);transform:skewX(-15deg);animation:shineSwipe 4s ease-in-out infinite 3s;}
.logo-mark span{font-family:'Cormorant';font-size:20px;font-weight:600;color:#fff;}
.logo-name{font-family:'Cormorant';font-size:22px;font-weight:500;color:#0c1a3a;letter-spacing:.5px;line-height:1;}
.logo-tag{font-family:'Space Mono';font-size:7px;color:#b8c3d8;letter-spacing:2.5px;margin-top:2px;}
.nav-links{display:flex;gap:2px;flex:1;}
.nl{padding:6px 13px;border-radius:8px;font-size:12.5px;font-weight:400;color:#6477a0;text-decoration:none;border:1px solid transparent;transition:all .2s;white-space:nowrap;cursor:pointer;background:none;}
.nl:hover{color:#0c1a3a;background:#f3f6ff;border-color:#e6ecff;}
.nl.active{color:#1a56db;background:#eff5ff;border-color:#dbeafe;font-weight:500;}
.langs{display:flex;gap:3px;margin-left:auto;}
.lb{padding:4px 10px;border-radius:6px;cursor:pointer;font-family:'Space Mono';font-size:9px;font-weight:700;letter-spacing:1px;background:transparent;border:1px solid #e6ecff;color:#8d9dbe;transition:all .2s;}
.lb:hover{border-color:#c2cde0;color:#455a8a;}
.lb.on{background:#0c1a3a;color:#fff;border-color:#0c1a3a;}

/* TICKER */
.ticker-wrap{background:#fffef9;border-bottom:1px solid rgba(12,26,58,.05);height:36px;display:flex;align-items:center;overflow:hidden;position:relative;z-index:49;}
.t-label{background:#fff8dc;border-right:1px solid #fce07a;color:#b07900;padding:0 20px 0 28px;height:100%;display:flex;align-items:center;flex-shrink:0;font-family:'Space Mono';font-size:9px;font-weight:700;letter-spacing:2.5px;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 50%,calc(100% - 10px) 100%,0 100%);}
.t-scroll{overflow:hidden;flex:1;}
.t-inner{display:flex;white-space:nowrap;}
.t-item{padding:0 44px;font-size:11.5px;color:#6477a0;display:flex;align-items:center;gap:8px;}
.t-cat{font-family:'Space Mono';font-size:8.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;}
.t-sep{width:3px;height:3px;border-radius:50%;background:#d8dfe8;flex-shrink:0;}

/* HERO */
.hero{max-width:1380px;margin:0 auto;padding:76px 40px 60px;position:relative;z-index:10;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
.hero-eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:28px;animation:fadeUp .7s ease both;}
.ey-pill{display:inline-flex;align-items:center;gap:7px;padding:5px 13px;border-radius:100px;background:#fff;border:1px solid #dde5f7;box-shadow:0 1px 2px rgba(12,26,58,.03),0 3px 10px rgba(12,26,58,.05);font-family:'Space Mono';font-size:9px;color:#6477a0;letter-spacing:2px;}
.ey-dot{width:6px;height:6px;border-radius:50%;animation:pulse 2s infinite;flex-shrink:0;}
.ey-rule{flex:1;height:1px;background:linear-gradient(90deg,#dde5f7,transparent);}
.hero-title{font-family:'Cormorant';font-weight:300;font-size:clamp(62px,8vw,112px);line-height:.9;letter-spacing:-2px;margin-bottom:26px;animation:fadeUp .75s .1s ease both;}
.ht1{display:block;color:#0c1a3a;}
.ht2{display:block;font-style:italic;font-weight:300;background:linear-gradient(115deg,#b07900 0%,#cc9200 35%,#f0c030 65%,#cc9200 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 2px 16px rgba(176,121,0,.18));}
.ht3{display:block;color:#6477a0;font-weight:300;}
.hero-lead{font-size:16px;color:#6477a0;line-height:1.78;font-weight:300;max-width:480px;margin-bottom:44px;animation:fadeUp .75s .2s ease both;}
.hero-nums{display:flex;gap:0;animation:fadeUp .75s .3s ease both;}
.hnum{padding-right:36px;margin-right:36px;border-right:1px solid #dde5f7;}
.hnum:last-child{border:none;padding:0;margin:0;}
.hnum-n{font-family:'Cormorant';font-size:50px;font-weight:500;color:#0c1a3a;line-height:1;display:flex;align-items:baseline;gap:2px;}
.hnum-n em{font-size:24px;color:#cc9200;font-style:italic;}
.hnum-l{font-family:'Space Mono';font-size:8px;color:#b8c3d8;letter-spacing:2.5px;margin-top:5px;text-transform:uppercase;}
.hero-right{animation:fadeUp .75s .15s ease both;}

/* STACKED JEWEL CARD */
.card-stack{position:relative;}
.cs3{position:absolute;bottom:-14px;left:18px;right:-10px;top:7px;border-radius:22px;background:#f3f6ff;border:1px solid #e6ecff;box-shadow:0 1px 3px rgba(12,26,58,.04);z-index:-2;}
.cs2{position:absolute;bottom:-7px;left:9px;right:-5px;top:3.5px;border-radius:22px;background:#f8faff;border:1px solid #e6ecff;box-shadow:0 3px 12px rgba(12,26,58,.06);z-index:-1;}
.cs1{border-radius:22px;overflow:hidden;background:#fff;box-shadow:0 16px 48px rgba(12,26,58,.08),0 40px 96px rgba(12,26,58,.06);border:1px solid rgba(255,255,255,.9);position:relative;z-index:1;}
.csi{overflow:hidden;position:relative;}
.csi img{width:100%;height:100%;object-fit:cover;transition:transform .6s;display:block;filter:brightness(.97) saturate(1.1);}
.cs1:hover .csi img{transform:scale(1.04);}
.csi::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,rgba(255,255,255,.5) 65%,#fff 100%);}
.csb{padding:22px 26px 26px;}
.csb-title{font-family:'Cormorant';font-size:21px;font-weight:500;color:#0c1a3a;line-height:1.3;margin-bottom:9px;}
.csb-meta{font-family:'Space Mono';font-size:9px;color:#b8c3d8;letter-spacing:1.5px;}

/* BREAKING */
.breaking{max-width:1380px;margin:0 auto 40px;padding:0 40px;position:relative;z-index:10;}
.bb-inner{display:flex;align-items:center;gap:14px;padding:13px 20px;border-radius:14px;background:linear-gradient(135deg,rgba(200,18,64,.04),rgba(255,244,248,.6));border:1px solid rgba(200,18,64,.1);box-shadow:0 2px 16px rgba(200,18,64,.05);}
.bb-badge{background:#f43060;color:#fff;padding:3px 11px;border-radius:5px;flex-shrink:0;font-family:'Space Mono';font-size:8px;font-weight:700;letter-spacing:2px;box-shadow:0 2px 10px rgba(200,18,64,.25);animation:float 2.5s ease-in-out infinite;}
.bb-text{font-size:12.5px;color:#1a2d52;line-height:1.4;font-weight:300;}

/* CONTENT AREA */
.content{max-width:1380px;margin:0 auto;padding:0 40px;position:relative;z-index:10;}
.s-head{display:flex;align-items:baseline;gap:14px;margin-bottom:22px;}
.s-title{font-family:'Cormorant';font-size:27px;font-weight:400;color:#0c1a3a;}
.s-rule{flex:1;height:1px;background:linear-gradient(90deg,#dde5f7,transparent);margin-top:3px;}
.s-n{font-family:'Space Mono';font-size:9px;color:#d8dfe8;letter-spacing:1.5px;}

/* CHIP */
.chip{display:inline-flex;align-items:center;gap:4px;margin-bottom:9px;padding:3px 9px;border-radius:100px;font-family:'Space Mono';font-size:8px;font-weight:700;letter-spacing:2px;}

/* CARDS */
.card{background:#fff;border-radius:18px;border:1px solid rgba(12,26,58,.06);box-shadow:0 2px 8px rgba(12,26,58,.05),0 8px 28px rgba(12,26,58,.07);overflow:hidden;text-decoration:none;color:inherit;display:block;transition:transform .3s cubic-bezier(.25,.46,.45,.94),box-shadow .3s;position:relative;cursor:pointer;}
.card::before{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);transform:skewX(-18deg);z-index:2;pointer-events:none;}
.card:hover{transform:translateY(-5px);box-shadow:0 6px 20px rgba(12,26,58,.07),0 20px 56px rgba(12,26,58,.1);}
.card:hover::before{animation:shineSwipe .5s ease forwards;}
.c-img{overflow:hidden;position:relative;}
.c-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s;filter:brightness(.97) saturate(1.1);}
.card:hover .c-img img{transform:scale(1.05);}
.c-img::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 25%,rgba(255,255,255,.08) 55%,rgba(255,255,255,.92) 100%);}
.c-body{padding:18px 20px 20px;}
.c-big .c-body{padding:22px 24px 24px;}
.c-title{font-family:'Cormorant';font-weight:500;color:#0c1a3a;line-height:1.2;margin-bottom:8px;}
.c-big .c-title{font-size:clamp(18px,1.9vw,22px);}
.card .c-title{font-size:clamp(13.5px,1.3vw,16px);}
.c-sum{font-size:13px;color:#6477a0;line-height:1.68;font-weight:300;}
.c-foot{display:flex;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid rgba(12,26,58,.05);}
.c-time{font-family:'Space Mono';font-size:9px;color:#d8dfe8;}
.c-views{font-family:'Space Mono';font-size:9px;color:#d8dfe8;margin-left:auto;}
.c-arr{width:26px;height:26px;border-radius:50%;margin-left:10px;background:#f3f6ff;border:1px solid #dde5f7;display:flex;align-items:center;justify-content:center;font-size:11px;color:#455a8a;flex-shrink:0;transition:all .25s;}
.card:hover .c-arr{background:#0c1a3a;color:#fff;border-color:#0c1a3a;transform:translate(3px,-3px);}

/* GRIDS */
.g-primary{display:grid;grid-template-columns:1.65fr 1fr 1fr;grid-template-rows:auto auto;gap:14px;}
.c-big{grid-row:span 2;}
.g-sec{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:14px;}

/* AD */
.ad-slot{border-radius:12px;background:#f8faff;border:1.5px dashed #dde5f7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;}
.ad-label{font-family:'Space Mono';font-size:9px;color:#d8dfe8;letter-spacing:2px;}
.ad-sub{font-family:'Space Mono';font-size:9px;color:#e6ecff;}

/* DIVIDER */
.divider{display:flex;align-items:center;gap:20px;margin:56px 0 28px;}
.div-rule{flex:1;height:1px;background:linear-gradient(90deg,#dde5f7,transparent);}
.div-label{font-family:'Cormorant';font-size:13px;font-weight:400;font-style:italic;color:#8d9dbe;letter-spacing:4px;text-transform:uppercase;white-space:nowrap;}

/* CATEGORY GRID */
.cat-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;}
.cat-c{border-radius:16px;padding:22px 14px 18px;text-align:center;background:#fff;border:1px solid rgba(12,26,58,.05);box-shadow:0 1px 3px rgba(12,26,58,.04);cursor:pointer;text-decoration:none;color:inherit;display:block;transition:all .3s;}
.cat-c:hover{transform:translateY(-5px);box-shadow:0 6px 20px rgba(12,26,58,.07),0 20px 56px rgba(12,26,58,.09);}
.cat-em{font-size:28px;display:block;margin-bottom:8px;animation:float 3s ease-in-out infinite;}
.cat-nm{font-family:'Space Mono';font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;display:block;margin-bottom:4px;}
.cat-n{font-size:11px;color:#b8c3d8;display:block;}

/* TWO-COL */
.two-col{display:grid;grid-template-columns:1fr 332px;gap:32px;}
.art-list{display:flex;flex-direction:column;}
.art-row{display:flex;gap:16px;padding:16px 0;border-bottom:1px solid rgba(12,26,58,.05);text-decoration:none;color:inherit;transition:all .2s;position:relative;cursor:pointer;}
.art-row::after{content:'';position:absolute;bottom:0;left:0;width:0;height:1px;background:linear-gradient(90deg,#fce07a,transparent);transition:width .35s;}
.art-row:hover::after{width:100%;}
.art-thumb{width:86px;height:63px;border-radius:10px;overflow:hidden;flex-shrink:0;box-shadow:0 2px 8px rgba(12,26,58,.07);}
.art-thumb img{width:100%;height:100%;object-fit:cover;filter:brightness(.97);}
.a-cat{font-family:'Space Mono';font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px;}
.a-title{font-family:'Cormorant';font-size:15px;font-weight:500;color:#0c1a3a;line-height:1.3;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.a-time{font-family:'Space Mono';font-size:8px;color:#d8dfe8;}

/* SIDEBAR */
.sidebar{display:flex;flex-direction:column;gap:18px;}
.widget{background:#fff;border-radius:16px;border:1px solid rgba(12,26,58,.06);box-shadow:0 2px 8px rgba(12,26,58,.05),0 8px 28px rgba(12,26,58,.07);overflow:hidden;}
.w-head{padding:14px 18px 12px;border-bottom:1px solid rgba(12,26,58,.05);display:flex;align-items:center;gap:8px;}
.w-dot{width:6px;height:6px;border-radius:50%;animation:pulse 2s infinite;flex-shrink:0;}
.w-lbl{font-family:'Space Mono';font-size:9px;font-weight:700;letter-spacing:3px;color:#b8c3d8;text-transform:uppercase;}
.eng-live{display:flex;align-items:center;gap:9px;padding:9px 18px 10px;background:linear-gradient(135deg,#f0fdf9,#fff);border-bottom:1px solid rgba(10,143,108,.06);}
.eng-dot{width:7px;height:7px;border-radius:50%;background:#2db891;box-shadow:0 0 8px #92e5cc;animation:pulse 1.8s infinite;flex-shrink:0;}
.eng-txt{font-family:'Space Mono';font-size:9px;color:#6477a0;}
.bar-row{padding:10px 18px;border-bottom:1px solid rgba(12,26,58,.04);}
.bar-row:last-child{border:none;}
.br-top{display:flex;justify-content:space-between;margin-bottom:5px;}
.br-name{font-size:11px;color:#455a8a;font-weight:400;}
.br-val{font-family:'Space Mono';font-size:10px;color:#3b76f7;}
.br-bg{height:3px;background:#eef2ff;border-radius:2px;overflow:hidden;}
.br-fill{height:100%;border-radius:2px;transition:width 2s cubic-bezier(.4,0,.2,1);}
.tr-item{display:flex;align-items:flex-start;gap:12px;padding:12px 18px;border-bottom:1px solid rgba(12,26,58,.04);cursor:pointer;transition:background .2s;}
.tr-item:last-child{border:none;}
.tr-item:hover{background:#f8faff;}
.tr-n{font-family:'Cormorant';font-size:28px;font-weight:300;font-style:italic;color:#dde5f7;line-height:1;flex-shrink:0;width:22px;padding-top:2px;}
.tr-title{font-family:'Cormorant';font-size:13.5px;font-weight:500;color:#1a2d52;line-height:1.3;margin-bottom:3px;}
.tr-meta{font-family:'Space Mono';font-size:8px;color:#d8dfe8;}

/* ARTICLE MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(12,26,58,.2);backdrop-filter:blur(8px);z-index:200;display:flex;align-items:flex-start;justify-content:center;padding:40px 20px;overflow-y:auto;animation:fadeIn .2s ease;}
.modal{background:#fff;border-radius:24px;width:100%;max-width:740px;box-shadow:0 32px 80px rgba(12,26,58,.18);overflow:hidden;animation:fadeUp .3s ease both;margin:auto;}
.modal-img{height:340px;overflow:hidden;position:relative;}
.modal-img img{width:100%;height:100%;object-fit:cover;display:block;}
.modal-img::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 30%,rgba(255,255,255,.4) 65%,#fff 100%);}
.modal-body{padding:32px 40px 40px;}
.modal-title{font-family:'Cormorant';font-size:clamp(24px,3vw,34px);font-weight:500;color:#0c1a3a;line-height:1.15;margin-bottom:14px;}
.modal-meta{font-family:'Space Mono';font-size:9px;color:#b8c3d8;letter-spacing:1.5px;margin-bottom:28px;display:flex;gap:14px;flex-wrap:wrap;}
.modal-content{font-size:15px;color:#455a8a;line-height:1.82;font-weight:300;}
.modal-content h2{font-family:'Cormorant';font-size:22px;font-weight:500;color:#0c1a3a;margin:24px 0 10px;padding-bottom:8px;border-bottom:1px solid #eef2ff;}
.modal-content p{margin-bottom:16px;}
.modal-close{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.9);border:1px solid rgba(12,26,58,.08);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;box-shadow:0 2px 8px rgba(12,26,58,.1);z-index:10;transition:all .2s;}
.modal-close:hover{background:#fff;transform:scale(1.1);}
.modal-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:24px;}
.modal-tag{padding:4px 12px;border-radius:100px;background:#f3f6ff;border:1px solid #e6ecff;font-family:'Space Mono';font-size:9px;color:#6477a0;letter-spacing:1px;}

/* GENERATE BUTTON */
.gen-btn{display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;background:linear-gradient(135deg,#1a56db,#3b76f7);color:#fff;border:none;cursor:pointer;font-family:'DM Sans';font-size:13px;font-weight:500;box-shadow:0 4px 20px rgba(26,86,219,.2);transition:all .2s;}
.gen-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(26,86,219,.3);}
.gen-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
.gen-btn .spin{animation:spin .8s linear infinite;}

/* SKELETON */
.skel{background:linear-gradient(90deg,#f3f6ff 25%,#eef2ff 50%,#f3f6ff 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px;}

/* LANG TAB (in content area) */
.lang-tabs{display:flex;gap:6px;margin-bottom:28px;}
.lang-tab{padding:7px 18px;border-radius:8px;font-family:'Space Mono';font-size:10px;font-weight:700;letter-spacing:1.5px;cursor:pointer;border:1px solid #e6ecff;background:transparent;color:#8d9dbe;transition:all .2s;}
.lang-tab.active{background:#0c1a3a;color:#fff;border-color:#0c1a3a;}

/* FOOTER */
footer{margin-top:96px;padding:64px 40px 28px;background:#f3f6ff;border-top:1px solid #e6ecff;position:relative;overflow:hidden;}
footer::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:120%;height:200px;background:radial-gradient(ellipse at 50% 0%,rgba(200,220,255,.25) 0%,transparent 70%);pointer-events:none;}
footer::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 5%,#fce07a 35%,#f5b700 50%,#fce07a 65%,transparent 95%);}
.foot-inner{max-width:1380px;margin:0 auto;position:relative;z-index:1;}
.foot-grid{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px;}
.foot-name{font-family:'Cormorant';font-size:32px;font-weight:400;color:#0c1a3a;letter-spacing:.5px;margin-bottom:12px;}
.foot-desc{font-size:13px;line-height:1.78;color:#6477a0;font-weight:300;}
.foot-langs{display:flex;gap:6px;margin-top:16px;}
.foot-pill{padding:4px 10px;border-radius:6px;background:#fff;border:1px solid #dde5f7;font-family:'Space Mono';font-size:8.5px;font-weight:700;letter-spacing:1px;color:#8d9dbe;}
.foot-head{font-family:'Space Mono';font-size:8.5px;letter-spacing:3px;color:#d8dfe8;margin-bottom:16px;text-transform:uppercase;}
.foot-lnk{display:block;font-size:13px;color:#6477a0;margin-bottom:9px;text-decoration:none;transition:color .2s;font-weight:300;}
.foot-lnk:hover{color:#0c1a3a;}
.foot-bot{border-top:1px solid #e6ecff;padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;}
.foot-copy{font-family:'Space Mono';font-size:9px;color:#d8dfe8;letter-spacing:1px;}

/* RESPONSIVE */
@media(max-width:900px){
  .hero{grid-template-columns:1fr;gap:40px;padding:48px 20px 40px;}
  .hero-right{display:none;}
  .g-primary{grid-template-columns:1fr 1fr;}
  .c-big{grid-row:auto;grid-column:span 2;}
  .g-sec{grid-template-columns:repeat(2,1fr);}
  .cat-grid{grid-template-columns:repeat(3,1fr);}
  .two-col{grid-template-columns:1fr;}
  .sidebar{display:none;}
  .foot-grid{grid-template-columns:1fr 1fr;}
  .topbar{padding:6px 20px;font-size:8px;}
  .nav-inner{padding:0 20px;}
  .content{padding:0 20px;}
  .breaking{padding:0 20px;}
}
`;

// ─────────────────────────────────────────────────────────
//  SKELETON CARD
// ─────────────────────────────────────────────────────────
const SkeletonCard = ({ big = false }) => (
  <div className={`card ${big ? "c-big" : ""}`} style={{ pointerEvents: "none" }}>
    <div className="c-img skel" style={{ height: big ? 300 : 160 }} />
    <div className="c-body">
      <div className="skel" style={{ height: 20, width: "40%", marginBottom: 10 }} />
      <div className="skel" style={{ height: big ? 24 : 18, marginBottom: 8 }} />
      {big && <div className="skel" style={{ height: 18, width: "80%", marginBottom: 8 }} />}
      <div className="skel" style={{ height: 14, width: "60%", marginTop: 14 }} />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
//  ARTICLE MODAL
// ─────────────────────────────────────────────────────────
const ArticleModal = ({ article, onClose }) => {
  if (!article) return null;
  const cat = catMeta(article.category);
  const bodyHtml = (article.body || "")
    .split("\n")
    .map((line, i) => {
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
      if (line.trim()) return `<p>${line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`;
      return "";
    })
    .join("");

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ position: "relative" }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-img">
          <img src={article.image} alt={article.title} />
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 12 }}>
            <span className="chip" style={{ background: cat.light, color: cat.color, border: `1px solid ${cat.border}` }}>
              {cat.emoji} {cat.label.toUpperCase()}
            </span>
          </div>
          <div className="modal-title">{article.title}</div>
          <div className="modal-meta">
            <span>📍 {article.location || "Africa"}</span>
            <span>🕐 {timeAgo(article.publishedAt)}</span>
            <span>👁 {fmtViews(article.views)}</span>
            <span>⏱ {article.readTime || 4} min read</span>
            <span style={{ color: "#cc9200" }}>🌐 {article.lang?.toUpperCase()}</span>
          </div>
          <div className="modal-content" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          {article.tags?.length > 0 && (
            <div className="modal-tags">
              {article.tags.map((t) => <span key={t} className="modal-tag">#{t}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  ARTICLE CARD
// ─────────────────────────────────────────────────────────
const Card = ({ article, big = false, onClick, style = {} }) => {
  const cat = catMeta(article.category);
  return (
    <div
      className={`card ${big ? "c-big" : ""}`}
      style={{ animationFillMode: "both", ...style }}
      onClick={() => onClick(article)}
    >
      <div className="c-img" style={{ height: big ? 300 : 165 }}>
        <img src={article.image} alt={article.title} loading="lazy" />
      </div>
      <div className="c-body">
        <span className="chip" style={{ background: cat.light, color: cat.color, border: `1px solid ${cat.border}` }}>
          {cat.emoji} {cat.label.toUpperCase()}
        </span>
        <div className="c-title">{article.title}</div>
        {big && <div className="c-sum">{article.summary}</div>}
        <div className="c-foot">
          <span className="c-time">{timeAgo(article.publishedAt)}</span>
          <span className="c-views">👁 {fmtViews(article.views)}</span>
          <span className="c-arr">→</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────────────────
export default function PulseAfrica() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [activeLang, setActiveLang] = useState("en");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [tickerArticles, setTickerArticles] = useState([]);
  const [countdown, setCountdown] = useState(3600 * 6);
  const [barWidths, setBarWidths] = useState([0, 0, 0, 0]);
  const tickerRef = useRef(null);

  // ── Generate articles on load ──────────────────────
  const generateBatch = useCallback(async (lang = "en") => {
    setLoading(true);
    setArticles([]);
    const cats = ["politics","sports","entertainment","africa","technology","business"];
    const results = [];
    // Generate 6 articles in parallel
    const promises = cats.map((cat) =>
      generateArticle(cat, lang).catch(() => null)
    );
    const res = await Promise.all(promises);
    res.forEach((a) => { if (a) results.push(a); });
    setArticles(results);
    setTickerArticles(results.slice(0, 6));
    setLoading(false);
    setTimeout(() => setBarWidths([85, 40, 94, 100]), 800);
  }, []);

  useEffect(() => { generateBatch("en"); }, []);

  // ── Countdown ──────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 21600)), 1000);
    return () => clearInterval(t);
  }, []);

  const fmtCountdown = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  // ── Clock ──────────────────────────────────────────
  const [time, setTime] = useState("");
  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Kigali" }) + " CAT");
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ── Filtered articles ──────────────────────────────
  const visible = activeTab === "all" ? articles : articles.filter((a) => a.category === activeTab);
  const featured = visible[0];
  const secondary = visible.slice(1, 5);
  const rest = visible.slice(5);

  // ── Language change ────────────────────────────────
  const handleLangChange = (lang) => {
    setActiveLang(lang);
    generateBatch(lang);
  };

  // ── Single article generate ────────────────────────
  const handleGenerateOne = async (cat) => {
    setGenerating(true);
    try {
      const a = await generateArticle(cat === "all" ? "politics" : cat, activeLang);
      setArticles((prev) => [a, ...prev.filter((x) => x.category !== a.category), ...prev.filter((x) => x.category === a.category).slice(1)]);
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Heaven atmospheric lights */}
      <div className="heaven" aria-hidden="true">
        <div className="h-apex" /><div className="h-amber" /><div className="h-azure" />
        <div className="h-rose" /><div className="h-jade" />
      </div>

      {/* ── TOP BAR ── */}
      <div className="topbar">
        <div className="live-badge"><div className="live-dot" />AI ENGINE LIVE</div>
        <span id="clk">{time}</span>
        <span>TRACKING 847 SOURCES · 54 COUNTRIES · 3 LANGUAGES</span>
      </div>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="logo" onClick={() => setActiveTab("all")}>
            <div className="logo-mark"><span>P</span></div>
            <div>
              <div className="logo-name">PulseAfrica</div>
              <div className="logo-tag">AI NEWS NETWORK</div>
            </div>
          </div>
          <div className="nav-links">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`nl ${activeTab === cat.id ? "active" : ""}`}
                onClick={() => setActiveTab(cat.id)}
              >
                {cat.id !== "all" ? `${cat.emoji} ` : "🌐 "}{cat.label}
              </button>
            ))}
          </div>
          <div className="langs">
            {[["en","EN"],["fr","FR"],["rw","RW"]].map(([code, label]) => (
              <button
                key={code}
                className={`lb ${activeLang === code ? "on" : ""}`}
                onClick={() => handleLangChange(code)}
              >{label}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* ── TICKER ── */}
      <div className="ticker-wrap">
        <div className="t-label">LIVE</div>
        <div className="t-scroll">
          <div className="t-inner" style={{ animation: "ticker 38s linear infinite" }}>
            {[...tickerArticles, ...tickerArticles].map((a, i) => {
              const c = catMeta(a.category);
              return (
                <span className="t-item" key={i}>
                  <span className="t-cat" style={{ color: c.color }}>{c.label}</span>
                  <span className="t-sep" />
                  {a.title}
                </span>
              );
            })}
            {/* Fallback when no articles yet */}
            {tickerArticles.length === 0 && (
              <span className="t-item" style={{ color: "#b8c3d8", fontStyle: "italic" }}>
                Loading latest African news...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">
            <div className="ey-pill">
              <div className="ey-dot" style={{ background: "#2db891", boxShadow: "0 0 8px #92e5cc" }} />
              AI-CURATED · EVERY 6 HOURS
            </div>
            <div className="ey-rule" />
            <div className="ey-pill" style={{ borderColor: "rgba(176,121,0,.2)", background: "#fffae8" }}>
              <div className="ey-dot" style={{ background: "#cc9200" }} />
              <span style={{ color: "#b07900" }}>🇷🇼 KINYARWANDA</span>
            </div>
          </div>

          <h1 className="hero-title">
            <span className="ht1">Africa's</span>
            <span className="ht2">Pulse,</span>
            <span className="ht3">illuminated.</span>
          </h1>

          <p className="hero-lead">
            Autonomous AI tracks 847 news sources across 54 nations — writing deep-insight articles published in English, Français and Ikinyarwanda. Every six hours, without pause.
          </p>

          <div className="hero-nums">
            {[["17","K","Articles"],["54","","Countries"],["3","","Languages"],["6","h","Cycle"]].map(([n, unit, label]) => (
              <div className="hnum" key={label}>
                <div className="hnum-n">{n}{unit && <em>{unit}</em>}</div>
                <div className="hnum-l">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-right">
          {loading ? (
            <div className="card-stack">
              <div className="cs3" /><div className="cs2" />
              <div className="cs1">
                <div className="skel" style={{ height: 270 }} />
                <div style={{ padding: "22px 26px 26px" }}>
                  <div className="skel" style={{ height: 20, width: "40%", marginBottom: 10 }} />
                  <div className="skel" style={{ height: 22, marginBottom: 8 }} />
                  <div className="skel" style={{ height: 14, width: "60%" }} />
                </div>
              </div>
            </div>
          ) : featured ? (
            <div className="card-stack" onClick={() => setSelectedArticle(featured)} style={{ cursor: "pointer" }}>
              <div className="cs3" /><div className="cs2" />
              <div className="cs1">
                <div className="csi" style={{ height: 270 }}>
                  <img src={featured.image} alt={featured.title} />
                </div>
                <div className="csb">
                  <div style={{ marginBottom: 10 }}>
                    {(() => { const c = catMeta(featured.category); return (
                      <span className="chip" style={{ background: c.light, color: c.color, border: `1px solid ${c.border}` }}>
                        {c.emoji} {c.label.toUpperCase()}
                      </span>
                    ); })()}
                  </div>
                  <div className="csb-title">{featured.title}</div>
                  <div className="csb-meta">{timeAgo(featured.publishedAt)} · 👁 {fmtViews(featured.views)} · {activeLang.toUpperCase()}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── BREAKING ── */}
      {featured && (
        <div className="breaking">
          <div className="bb-inner">
            <div className="bb-badge">BREAKING</div>
            <div className="bb-text">{featured.summary}</div>
          </div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <div className="content">

        {/* Controls */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
          <div className="s-head" style={{ margin:0 }}>
            <div className="s-title">Top Stories</div>
            <div className="s-rule" />
            <div className="s-n">{articles.length} ARTICLES</div>
          </div>
          <button
            className="gen-btn"
            onClick={() => generateBatch(activeLang)}
            disabled={loading}
          >
            {loading ? <span className="spin">⟳</span> : "⟳"}
            {loading ? "Generating..." : "Generate New Articles"}
          </button>
        </div>

        {/* Lang tabs */}
        <div className="lang-tabs">
          {[["en","🇬🇧 English"],["fr","🇫🇷 Français"],["rw","🇷🇼 Kinyarwanda"]].map(([code, label]) => (
            <button key={code} className={`lang-tab ${activeLang === code ? "active" : ""}`} onClick={() => handleLangChange(code)}>
              {label}
            </button>
          ))}
        </div>

        {/* Primary Grid */}
        <div className="g-primary">
          {loading ? (
            <>
              <SkeletonCard big />
              <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
            </>
          ) : (
            <>
              {featured && <Card article={featured} big onClick={setSelectedArticle} style={{ animation: "fadeUp .5s .1s ease both" }} />}
              {secondary.map((a, i) => (
                <Card key={a.id} article={a} onClick={setSelectedArticle} style={{ animation: `fadeUp .5s ${.2 + i*.07}s ease both` }} />
              ))}
            </>
          )}
        </div>

        {/* Ad slot */}
        <div className="ad-slot" style={{ height:88, marginTop:20 }}>
          <div className="ad-label">ADVERTISEMENT · 728×90 · Google AdSense</div>
          <div className="ad-sub">Apply at adsense.google.com after launch</div>
        </div>

        {/* Secondary grid */}
        {rest.length > 0 && (
          <div className="g-sec" style={{ animation: "fadeUp .5s .4s ease both" }}>
            {rest.slice(0,4).map((a, i) => (
              <Card key={a.id} article={a} onClick={setSelectedArticle} style={{ animation: `fadeUp .5s ${.4+i*.07}s ease both` }} />
            ))}
          </div>
        )}

        {/* Categories */}
        <div className="divider"><div className="div-rule" /><div className="div-label">Browse by Category</div><div className="div-rule" /></div>
        <div className="cat-grid">
          {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
            const count = articles.filter((a) => a.category === cat.id).length;
            return (
              <div
                key={cat.id} className="cat-c"
                style={{ background: `linear-gradient(160deg,#fff,${cat.light})` }}
                onClick={() => setActiveTab(cat.id)}
              >
                <span className="cat-em">{cat.emoji}</span>
                <span className="cat-nm" style={{ color: cat.color }}>{cat.label}</span>
                <span className="cat-n">{count} article{count !== 1 ? "s" : ""}</span>
              </div>
            );
          })}
        </div>

        {/* Latest + sidebar */}
        <div className="divider"><div className="div-rule" /><div className="div-label">Latest Stories</div><div className="div-rule" /></div>
        <div className="two-col">
          <div>
            <div className="art-list">
              {loading
                ? Array(6).fill(0).map((_, i) => (
                    <div key={i} className="art-row" style={{ pointerEvents:"none" }}>
                      <div className="art-thumb skel" />
                      <div style={{ flex:1 }}>
                        <div className="skel" style={{ height:11, width:"30%", marginBottom:6 }} />
                        <div className="skel" style={{ height:16, marginBottom:5 }} />
                        <div className="skel" style={{ height:11, width:"50%" }} />
                      </div>
                    </div>
                  ))
                : articles.map((a) => {
                    const c = catMeta(a.category);
                    return (
                      <div key={a.id} className="art-row" onClick={() => setSelectedArticle(a)}>
                        <div className="art-thumb">
                          <img src={a.image} alt={a.title} loading="lazy" />
                        </div>
                        <div>
                          <div className="a-cat" style={{ color: c.color }}>{c.emoji} {c.label}</div>
                          <div className="a-title">{a.title}</div>
                          <div className="a-time">{timeAgo(a.publishedAt)} · 👁 {fmtViews(a.views)}</div>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
            <div className="ad-slot" style={{ height:250, marginTop:24 }}>
              <div className="ad-label">ADVERTISEMENT · 300×250</div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* AI Engine */}
            <div className="widget">
              <div className="w-head">
                <div className="w-dot" style={{ background:"#2db891", boxShadow:"0 0 8px #92e5cc" }} />
                <div className="w-lbl">AI Engine Status</div>
              </div>
              <div className="eng-live">
                <div className="eng-dot" />
                <div className="eng-txt">NEXT CYCLE IN {fmtCountdown(countdown)}</div>
              </div>
              {[
                ["Sources Tracked","847","linear-gradient(90deg,#3b76f7,#93b8ff)", barWidths[0]],
                ["Articles Generated",articles.length,"linear-gradient(90deg,#2db891,#92e5cc)", Math.min((articles.length/20)*100,100)],
                ["Avg SEO Score","9.4/10","linear-gradient(90deg,#cc9200,#f5b700)", barWidths[2]],
                ["Languages Active","EN·FR·RW","linear-gradient(90deg,#f43060,#fca5b3)", barWidths[3]],
              ].map(([name, val, grad, w]) => (
                <div className="bar-row" key={name}>
                  <div className="br-top"><span className="br-name">{name}</span><span className="br-val">{val}</span></div>
                  <div className="br-bg"><div className="br-fill" style={{ width: `${w}%`, background: grad }} /></div>
                </div>
              ))}
            </div>

            {/* Trending */}
            <div className="widget">
              <div className="w-head">
                <div className="w-dot" style={{ background:"#cc9200", boxShadow:"0 0 8px #fce07a" }} />
                <div className="w-lbl">Trending Now</div>
              </div>
              {articles.slice(0,5).map((a, i) => (
                <div className="tr-item" key={a.id} onClick={() => setSelectedArticle(a)}>
                  <div className="tr-n">{i+1}</div>
                  <div>
                    <div className="tr-title">{a.title}</div>
                    <div className="tr-meta">🔥 {fmtViews(a.views)} VIEWS</div>
                  </div>
                </div>
              ))}
              {loading && Array(5).fill(0).map((_,i) => (
                <div className="tr-item" key={i}>
                  <div className="tr-n skel" style={{ width:22, height:28 }} />
                  <div style={{ flex:1 }}>
                    <div className="skel" style={{ height:14, marginBottom:5 }} />
                    <div className="skel" style={{ height:10, width:"50%" }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Generate specific category */}
            <div className="widget">
              <div className="w-head">
                <div className="w-dot" style={{ background:"#1a56db", boxShadow:"0 0 8px #a3beff" }} />
                <div className="w-lbl">Generate Article</div>
              </div>
              <div style={{ padding:"12px 18px 18px", display:"flex", flexDirection:"column", gap:8 }}>
                <div style={{ fontSize:11, color:"#8d9dbe", marginBottom:4, fontFamily:"'DM Sans'" }}>
                  Pick a category to generate a fresh article now:
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleGenerateOne(cat.id)}
                      disabled={generating || loading}
                      style={{
                        padding:"5px 10px", borderRadius:8, border:`1px solid ${cat.border}`,
                        background: cat.light, color: cat.color, cursor:"pointer",
                        fontFamily:"'Space Mono'", fontSize:9, fontWeight:700, letterSpacing:1.5,
                        transition:"all .2s", opacity: generating ? .6 : 1,
                      }}
                    >{cat.emoji} {cat.label.slice(0,5).toUpperCase()}</button>
                  ))}
                </div>
                {generating && (
                  <div style={{ fontSize:11, color:"#2db891", fontFamily:"'Space Mono'", display:"flex", gap:6, alignItems:"center" }}>
                    <span style={{ animation:"spin .8s linear infinite", display:"inline-block" }}>⟳</span> Writing article...
                  </div>
                )}
              </div>
            </div>

            <div className="ad-slot" style={{ height:250 }}>
              <div className="ad-label">ADVERTISEMENT</div>
              <div className="ad-sub">300×250 · AdSense</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="foot-inner">
          <div className="foot-grid">
            <div>
              <div className="foot-name">PulseAfrica</div>
              <p className="foot-desc">AI-powered news tracking 54 African nations 24/7. Deep analysis published automatically every 6 hours in English, Français and Ikinyarwanda.</p>
              <div className="foot-langs">
                <span className="foot-pill">🇬🇧 English</span>
                <span className="foot-pill">🇫🇷 Français</span>
                <span className="foot-pill">🇷🇼 Kinyarwanda</span>
              </div>
            </div>
            <div>
              <div className="foot-head">Categories</div>
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                <div key={c.id} className="foot-lnk" onClick={() => setActiveTab(c.id)} style={{ cursor:"pointer" }}>
                  {c.emoji} {c.label}
                </div>
              ))}
            </div>
            <div>
              <div className="foot-head">Company</div>
              {["About PulseAfrica","How It Works","Advertise With Us","Contact"].map((t) => (
                <div key={t} className="foot-lnk" style={{ cursor:"pointer" }}>{t}</div>
              ))}
            </div>
            <div>
              <div className="foot-head">Legal</div>
              {["Privacy Policy","Terms of Service","Cookie Policy"].map((t) => (
                <div key={t} className="foot-lnk" style={{ cursor:"pointer" }}>{t}</div>
              ))}
            </div>
          </div>
          <div className="foot-bot">
            <span className="foot-copy">© 2025 PULSEAFRICA · AI-GENERATED NEWS & ANALYSIS</span>
            <span className="foot-copy">BUILT WITH CLAUDE AI · NEXT.JS · SUPABASE · VERCEL</span>
          </div>
        </div>
      </footer>

      {/* ── ARTICLE MODAL ── */}
      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </>
  );
}
