/**
 * Property-based tests for search index generation
 * Feature: SSGEpub, Property 10: Search Index Contains All Book Fields
 * Validates: Requirements 4.1
 */

const fc = require('fast-check');
const { generateSearchIndex } = require('../.eleventy.js');

// Arbitrary for a book object with all fields
const bookArb = fc.record({
  data: fc.record({
    title: fc.string({ minLength: 1, maxLength: 100 }),
    author: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.option(fc.string({ maxLength: 500 }), { nil: '' }),
    tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }), { nil: [] }),
    cover: fc.webUrl(),
    downloadLinks: fc.array(
      fc.record({ url: fc.webUrl(), platform: fc.string({ minLength: 1 }) }),
      { minLength: 1, maxLength: 3 }
    )
  }),
  fileSlug: fc.string({ minLength: 1, maxLength: 50 })
});

// Arbitrary for array of books
const booksArrayArb = fc.array(bookArb, { minLength: 0, maxLength: 30 });

describe('Search Index Generation', () => {
  /**
   * Property 10: Search Index Contains All Book Fields
   * For any book in the collection, the generated search index entry
   * SHALL contain title, author, description, tags, and url fields matching the book data.
   * Validates: Requirements 4.1
   */
  test('Property 10: Search index contains all required fields for each book', () => {
    fc.assert(
      fc.property(booksArrayArb, (books) => {
        const searchIndex = generateSearchIndex(books);
        
        // Same number of entries as books
        expect(searchIndex.length).toBe(books.length);
        
        // Each entry has all required fields
        searchIndex.forEach((entry, i) => {
          const book = books[i];
          
          // Check all required fields exist
          expect(entry).toHaveProperty('title');
          expect(entry).toHaveProperty('author');
          expect(entry).toHaveProperty('description');
          expect(entry).toHaveProperty('tags');
          expect(entry).toHaveProperty('url');
          
          // Check values match book data
          expect(entry.title).toBe(book.data?.title || '');
          expect(entry.author).toBe(book.data?.author || '');
          expect(entry.description).toBe(book.data?.description || '');
          expect(entry.tags).toEqual(book.data?.tags || []);
          expect(entry.url).toBe(`/books/${book.fileSlug || ''}.html`);
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Search index entries have correct types
   */
  test('Search index entries have correct field types', () => {
    fc.assert(
      fc.property(booksArrayArb, (books) => {
        const searchIndex = generateSearchIndex(books);
        
        searchIndex.forEach(entry => {
          expect(typeof entry.title).toBe('string');
          expect(typeof entry.author).toBe('string');
          expect(typeof entry.description).toBe('string');
          expect(Array.isArray(entry.tags)).toBe(true);
          expect(typeof entry.url).toBe('string');
        });
      }),
      { numRuns: 100 }
    );
  });
});
