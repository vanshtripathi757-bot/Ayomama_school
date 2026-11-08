import test from 'node:test';
import assert from 'node:assert/strict';
import { LIBRARY_BOOKS, getOwnedLibraryBookIds, takeLibraryBook, returnLibraryBook } from './LibraryBookSystem';

test('library catalog uses unique stable ids and original readable content', () => {
  const ids = LIBRARY_BOOKS.map((book) => book.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(LIBRARY_BOOKS.every((book) => book.title && book.author && book.content.length >= 2));
});

test('taking a book is idempotent and preserves unrelated inventory items', () => {
  const initial = ['Hoshikaze Archive Medal'];
  const once = takeLibraryBook(initial, LIBRARY_BOOKS[0].id);
  const twice = takeLibraryBook(once, LIBRARY_BOOKS[0].id);
  assert.deepEqual(twice, once);
  assert.deepEqual(getOwnedLibraryBookIds(twice), [LIBRARY_BOOKS[0].id]);
  assert.ok(twice.includes('Hoshikaze Archive Medal'));
});

test('unknown books cannot be added and returning removes only the selected book', () => {
  const inventory = takeLibraryBook(takeLibraryBook(['Clue: Blue Star'], LIBRARY_BOOKS[0].id), LIBRARY_BOOKS[1].id);
  const returned = returnLibraryBook(inventory, LIBRARY_BOOKS[0].id);
  assert.deepEqual(getOwnedLibraryBookIds(returned), [LIBRARY_BOOKS[1].id]);
  assert.ok(returned.includes('Clue: Blue Star'));
  assert.deepEqual(takeLibraryBook(returned, 'unknown-book'), returned);
});
