// ── PulseAfrica AI Journalist Personas ───────────────────
export const AUTHORS = [
  {
    id: 'amara-diallo',
    name: 'Amara Diallo',
    title: 'Senior Africa Correspondent',
    avatar: 'AD',
    color: 'var(--amber)',
    bio: 'Amara covers politics and governance across West and Central Africa. Based in Dakar, she specialises in democratic transitions and regional diplomacy.',
    specialties: ['politics', 'africa'],
    twitter: '@AmaraDialloPulse',
  },
  {
    id: 'kwame-asante',
    name: 'Kwame Asante',
    title: 'Sports & Culture Editor',
    avatar: 'KA',
    color: 'var(--jade)',
    bio: 'Kwame is PulseAfrica\'s lead sports journalist, tracking AFCON, the Premier League\'s African stars, and the rise of African athletics on the world stage.',
    specialties: ['sports', 'entertainment'],
    twitter: '@KwameAsantePulse',
  },
  {
    id: 'nadia-okonkwo',
    name: 'Nadia Okonkwo',
    title: 'Tech & Business Reporter',
    avatar: 'NO',
    color: 'var(--sap)',
    bio: 'Nadia reports on Africa\'s booming tech ecosystems, fintech innovation, and cross-border trade. She previously covered Silicon Savannah from Nairobi.',
    specialties: ['technology', 'business'],
    twitter: '@NadiaOkonkwoPulse',
  },
  {
    id: 'ibrahim-hassan',
    name: 'Ibrahim Hassan',
    title: 'East Africa Bureau Chief',
    avatar: 'IH',
    color: 'var(--ruby)',
    bio: 'Ibrahim leads PulseAfrica\'s East Africa coverage from Kigali. He specialises in economic development, infrastructure, and the EAC integration agenda.',
    specialties: ['africa', 'business', 'politics'],
    twitter: '@IbrahimHassanPulse',
  },
  {
    id: 'zainab-mensah',
    name: 'Zainab Mensah',
    title: 'Entertainment & Lifestyle Writer',
    avatar: 'ZM',
    color: 'var(--violet)',
    bio: 'Zainab covers Afrobeats, Nollywood, African fashion and the creative economy. She believes African culture is the continent\'s most powerful export.',
    specialties: ['entertainment', 'africa'],
    twitter: '@ZainabMensahPulse',
  },
  {
    id: 'chidi-eze',
    name: 'Chidi Eze',
    title: 'Investigations & Analysis',
    avatar: 'CE',
    color: 'var(--copper2)',
    bio: 'Chidi specialises in long-form investigative journalism covering corruption, climate change, and humanitarian crises across the African continent.',
    specialties: ['politics', 'africa', 'business'],
    twitter: '@ChidiEzePulse',
  },
]

// Pick best author for a category
export function getAuthorForCategory(category) {
  const matches = AUTHORS.filter(a => a.specialties.includes(category))
  const pool = matches.length > 0 ? matches : AUTHORS
  return pool[Math.floor(Math.random() * pool.length)]
}

// Get author by ID
export function getAuthorById(id) {
  return AUTHORS.find(a => a.id === id) || AUTHORS[0]
}
