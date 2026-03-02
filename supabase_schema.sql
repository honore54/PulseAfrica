-- ══════════════════════════════════════════════════════════
--  PulseAfrica — Supabase Schema
--  Run this in your Supabase SQL Editor
-- ══════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Idempotent compatibility fixes ─────────────────────────
-- If an `articles` table already exists but is missing some columns
-- (for example when you're iterating on the schema in Supabase),
-- adding columns here with `IF NOT EXISTS` prevents index/constraint
-- creation later in the file from failing with "column does not exist".
alter table if exists articles add column if not exists published_at timestamptz default now();
alter table if exists articles add column if not exists views integer default 0;
alter table if exists articles add column if not exists read_time integer default 4;
alter table if exists articles add column if not exists location text default 'Africa';
alter table if exists articles add column if not exists tags text[] default '{}';
alter table if exists articles add column if not exists seo_title text;
alter table if exists articles add column if not exists seo_desc text;
alter table if exists articles add column if not exists title_en text;
alter table if exists articles add column if not exists summary_en text;
alter table if exists articles add column if not exists content_en text;
alter table if exists articles add column if not exists title_fr text;
alter table if exists articles add column if not exists summary_fr text;
alter table if exists articles add column if not exists content_fr text;
alter table if exists articles add column if not exists title_rw text;
alter table if exists articles add column if not exists summary_rw text;
alter table if exists articles add column if not exists content_rw text;
alter table if exists articles add column if not exists created_at timestamptz default now();

-- ── Articles table ─────────────────────────────────────────
-- ── Articles table (idempotent) ───────────────────────────
-- We create the table if it doesn't exist, then run a set of
-- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements so the
-- script can be re-run safely against an existing table that may
-- be missing some columns (this is common when iterating on schema).
create table if not exists articles (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,
  category     text not null check (category in ('politics','sports','entertainment','africa','technology','business')),
  image_url    text,
  published_at timestamptz not null default now(),
  views        integer not null default 0,
  read_time    integer not null default 4,
  location     text default 'Africa',
  tags         text[] default '{}',
  seo_title    text,
  seo_desc     text,

  -- English
  title_en   text not null,
  summary_en text,
  content_en text,

  -- French
  title_fr   text,
  summary_fr text,
  content_fr text,

  -- Kinyarwanda
  title_rw   text,
  summary_rw text,
  content_rw text,

  created_at timestamptz default now()
);

-- ── Indexes for fast querying ──────────────────────────────
create index if not exists articles_category_idx    on articles(category);
create index if not exists articles_published_idx   on articles(published_at desc);
create index if not exists articles_slug_idx        on articles(slug);

-- ── Row Level Security ─────────────────────────────────────
-- Enable RLS (safe if table exists)
alter table if exists articles enable row level security;

-- Recreate policies idempotently: drop if exists then create
drop policy if exists "Public can read articles" on articles;
create policy "Public can read articles"
  on articles for select
  using (true);

drop policy if exists "Service role can insert" on articles;
create policy "Service role can insert"
  on articles for insert
  with check (auth.role() = 'service_role');

drop policy if exists "Service role can update" on articles;
create policy "Service role can update"
  on articles for update
  using (auth.role() = 'service_role');

-- ── increment_views function ───────────────────────────────
create or replace function increment_views(article_slug text)
returns void
language plpgsql
security definer
as $$
begin
  update articles set views = views + 1 where slug = article_slug;
end;
$$;

-- ── Sample seed data (optional — delete if you want) ──────
-- Insert a test article so the homepage isn't empty on first load
insert into articles (
  slug, category, image_url, read_time, location, tags,
  title_en, summary_en, content_en,
  title_fr, summary_fr, content_fr,
  title_rw, summary_rw, content_rw,
  seo_title, seo_desc
) values (
  'welcome-pulseafrica-africa-ai-news',
  'africa',
  'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1200&h=675&fit=crop&auto=format&q=85',
  3,
  'Kigali, Rwanda',
  array['AI', 'Africa', 'news', 'technology', 'innovation'],

  'PulseAfrica Launches: AI-Powered News for 54 African Nations',
  'PulseAfrica is live — the continent''s first fully autonomous AI news network covering all 54 African nations in English, Français and Ikinyarwanda. Publishing every 6 hours, around the clock, powered by Claude AI.',
  '## A New Era for African News

PulseAfrica represents a landmark moment for African journalism. Powered by Claude AI, this platform tracks over 847 news sources across the continent, generating in-depth analysis and breaking news in three languages simultaneously.

## How It Works

Every six hours, the AI engine scans hundreds of African news sources, identifies the most significant stories across six categories — Politics, Sports, Entertainment, Africa News, Technology and Business — and generates comprehensive, contextualised articles.

Each article is written natively in English, French and Kinyarwanda, ensuring that readers across the continent can access news in their preferred language.

## Built for Africa, By Africa

"We built PulseAfrica because Africa''s story deserves to be told on Africa''s terms," said the founding team. "Too often, continental coverage is filtered through foreign lenses. PulseAfrica changes that — AI-powered, African-focused, always on."

## What to Expect

New articles publish automatically every 6 hours across all six categories. The more the platform publishes, the more Google indexes it, bringing organic traffic and growing the audience organically.

Stay tuned — Africa''s pulse has never been this clear.',

  'PulseAfrica : L''IA au service de l''actualité africaine',
  'PulseAfrica est en ligne — le premier réseau d''information IA couvrant les 54 nations africaines en anglais, français et kinyarwanda. Publication automatique toutes les 6 heures.',
  '## Une nouvelle ère pour l''information africaine

PulseAfrica représente un tournant majeur pour le journalisme africain. Propulsé par Claude AI, cette plateforme surveille plus de 847 sources d''information à travers le continent.

## Comment ça marche

Toutes les six heures, le moteur IA analyse des centaines de sources africaines, identifie les histoires les plus importantes et génère des articles approfondis en trois langues simultanément.

## Construit pour l''Afrique

Chaque article est rédigé nativement en anglais, français et kinyarwanda, garantissant un accès à l''information pour tous les lecteurs du continent.

Restez connectés — le pouls de l''Afrique n''a jamais été aussi clair.',

  'PulseAfrica Yatangiye: Amakuru y''Ubukorikori mu Afurika',
  'PulseAfrica ni interineti ya mbere iy''amakuru ikoresheje ubwenge bwa AI mu mahanga 54 y''Afurika, yandikwa mu Cyongereza, Igifaransa na Kinyarwanda.',
  '## Igihe Gishya cy''Amakuru mu Afurika

PulseAfrica igaragaza impinduka nkuru mu nzego z''amakuru mu Afurika. Ikoresheje Claude AI, iri platform ikurikirana inkomoko zirenga 847 z''amakuru ku mugabane wose.

## Uko Bikorwa

Buri masaha 6, inzira ya AI isesengura amakuru menshi, ishaka inkuru nkuru, hanyuma irandika ingingo zijyanye n''amategeko, siporo, imyidagaduro, Afurika, ikoranabuhanga, n''ubucuruzi.

## Yubakiwe Afurika

PulseAfrica yubakiwe Afurika — amakuru y''Afurika mu ndimi z''Afurika. Mukurikire!',

  'PulseAfrica — AI News for All 54 African Nations | English, French, Kinyarwanda',
  'PulseAfrica delivers AI-powered African news in English, Français and Kinyarwanda. Updated every 6 hours across 6 categories. 54 nations covered.'
) on conflict (slug) do nothing;
