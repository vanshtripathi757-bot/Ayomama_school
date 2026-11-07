export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  summary: string;
  content: string[];
}

export const LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: 'book-campus-history',
    title: 'A Short History of Seiran Academy',
    author: 'M. Hoshino',
    category: 'History',
    summary: 'The founding ideals and traditions of the academy.',
    content: [
      'Seiran Academy began as a small school built around a simple promise: talent should be developed through curiosity, discipline, and cooperation.',
      'Its four classes were designed to encourage healthy competition without making any student feel that their future was already decided.',
      'The old star emblem above the entrance represents the idea that individual effort can guide a whole community.'
    ]
  },
  {
    id: 'book-observation',
    title: 'The Practice of Observation',
    author: 'Professor Arai',
    category: 'Study Skills',
    summary: 'How careful observation turns details into useful knowledge.',
    content: [
      'Observation is more than looking. It means noticing what changed, comparing details, and checking whether an explanation fits the evidence.',
      'A useful notebook separates what you saw from what you think it means. This small habit makes conclusions more reliable.',
      'When a problem feels difficult, begin with one precise detail. Good questions often grow from careful attention.'
    ]
  },
  {
    id: 'book-stargazing',
    title: 'The Student Guide to the Night Sky',
    author: 'Kei Mori',
    category: 'Science',
    summary: 'An introduction to stars, constellations, and patient discovery.',
    content: [
      'The night sky changes slowly across the seasons. Learning a few bright stars makes it easier to recognise larger patterns.',
      'A constellation is a pattern that people use to organise the sky. The stars in a pattern may be very far apart in space.',
      'Astronomy rewards patience. Record the date, time, and direction of an observation so that you can compare it later.'
    ]
  },
  {
    id: 'book-teamwork',
    title: 'Small Teams, Strong Ideas',
    author: 'R. Takeda',
    category: 'Leadership',
    summary: 'Practical lessons on listening, planning, and sharing responsibility.',
    content: [
      'A strong team does not need everyone to think alike. It needs clear goals and room for different viewpoints.',
      'Before dividing a task, make sure each person understands the result the group is trying to achieve.',
      'Give credit openly, ask for help early, and review mistakes without turning them into blame.'
    ]
  }
];

const BOOK_PREFIX = 'library-book:';

export function getOwnedLibraryBookIds(inventoryItems: readonly string[] = []): string[] {
  const validIds = new Set(LIBRARY_BOOKS.map((book) => book.id));
  return [...new Set(inventoryItems
    .filter((item) => item.startsWith(BOOK_PREFIX))
    .map((item) => item.slice(BOOK_PREFIX.length))
    .filter((id) => validIds.has(id)))];
}

export function takeLibraryBook(inventoryItems: readonly string[], bookId: string): string[] {
  if (!LIBRARY_BOOKS.some((book) => book.id === bookId)) return [...inventoryItems];
  const token = BOOK_PREFIX + bookId;
  return inventoryItems.includes(token) ? [...inventoryItems] : [...inventoryItems, token];
}

export function returnLibraryBook(inventoryItems: readonly string[], bookId: string): string[] {
  const token = BOOK_PREFIX + bookId;
  return inventoryItems.filter((item) => item !== token);
}
