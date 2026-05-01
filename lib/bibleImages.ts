/**
 * Map a Bible reference (e.g. "Genesis 1", "John 3:16-21", "Psalm 23")
 * to a thematic illustration stored under /public/images/bible/.
 */

export interface BibleImage {
  src: string
  alt: string
  theme: string
}

const IMG = (file: string) => `/images/bible/${file}`

const THEMES = {
  creation:   { src: IMG('creation.svg'),   alt: 'Ilustração — criação',           theme: 'creation' },
  wisdom:     { src: IMG('wisdom.svg'),     alt: 'Ilustração — sabedoria',         theme: 'wisdom' },
  prophets:   { src: IMG('prophets.svg'),   alt: 'Ilustração — profetas',          theme: 'prophets' },
  gospels:    { src: IMG('gospels.svg'),    alt: 'Ilustração — evangelhos',        theme: 'gospels' },
  epistles:   { src: IMG('epistles.svg'),   alt: 'Ilustração — cartas apostólicas', theme: 'epistles' },
  revelation: { src: IMG('revelation.svg'), alt: 'Ilustração — apocalipse',        theme: 'revelation' },
  default:    { src: IMG('default.svg'),    alt: 'Ilustração — Bíblia aberta',     theme: 'default' },
} as const satisfies Record<string, BibleImage>

const BOOK_THEME: Record<string, keyof typeof THEMES> = {
  // Pentateuch + history → creation
  'Genesis': 'creation', 'Exodus': 'creation', 'Leviticus': 'creation',
  'Numbers': 'creation', 'Deuteronomy': 'creation',
  'Joshua': 'creation', 'Judges': 'creation', 'Ruth': 'creation',
  '1 Samuel': 'creation', '2 Samuel': 'creation',
  '1 Kings': 'creation', '2 Kings': 'creation',
  '1 Chronicles': 'creation', '2 Chronicles': 'creation',
  'Ezra': 'creation', 'Nehemiah': 'creation', 'Esther': 'creation',
  // Wisdom literature → wisdom
  'Job': 'wisdom', 'Psalms': 'wisdom', 'Psalm': 'wisdom',
  'Proverbs': 'wisdom', 'Ecclesiastes': 'wisdom', 'Song of Solomon': 'wisdom',
  // Prophets → prophets
  'Isaiah': 'prophets', 'Jeremiah': 'prophets', 'Lamentations': 'prophets',
  'Ezekiel': 'prophets', 'Daniel': 'prophets', 'Hosea': 'prophets',
  'Joel': 'prophets', 'Amos': 'prophets', 'Obadiah': 'prophets',
  'Jonah': 'prophets', 'Micah': 'prophets', 'Nahum': 'prophets',
  'Habakkuk': 'prophets', 'Zephaniah': 'prophets', 'Haggai': 'prophets',
  'Zechariah': 'prophets', 'Malachi': 'prophets',
  // Gospels + Acts → gospels
  'Matthew': 'gospels', 'Mark': 'gospels', 'Luke': 'gospels', 'John': 'gospels',
  'Acts': 'gospels',
  // Epistles → epistles
  'Romans': 'epistles', '1 Corinthians': 'epistles', '2 Corinthians': 'epistles',
  'Galatians': 'epistles', 'Ephesians': 'epistles', 'Philippians': 'epistles',
  'Colossians': 'epistles', '1 Thessalonians': 'epistles', '2 Thessalonians': 'epistles',
  '1 Timothy': 'epistles', '2 Timothy': 'epistles', 'Titus': 'epistles',
  'Philemon': 'epistles', 'Hebrews': 'epistles', 'James': 'epistles',
  '1 Peter': 'epistles', '2 Peter': 'epistles',
  '1 John': 'epistles', '2 John': 'epistles', '3 John': 'epistles',
  'Jude': 'epistles',
  // Revelation
  'Revelation': 'revelation',
}

/** Extract the book name from a reference string. "John 3:16-21" → "John". */
export function parseBookName(reference: string): string | null {
  const m = reference.trim().match(/^(\d?\s?[A-Za-z][A-Za-z ]+?)\s+\d/)
  return m ? m[1].trim() : null
}

/** Pick a thematic image for a single reference. */
export function imageForReference(reference: string): BibleImage {
  const book = parseBookName(reference)
  if (!book) return THEMES.default
  const theme = BOOK_THEME[book]
  return theme ? THEMES[theme] : THEMES.default
}

/**
 * Pick a single image to represent a day of readings (possibly multiple references).
 * Heuristic: use the first reference that has a non-default mapping;
 * fall back to the first reference; fall back to default.
 */
export function imageForReadings(readings: string[]): BibleImage {
  for (const ref of readings) {
    const img = imageForReference(ref)
    if (img.theme !== 'default') return img
  }
  return readings[0] ? imageForReference(readings[0]) : THEMES.default
}
