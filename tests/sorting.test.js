/**
 * Property-based tests for books collection sorting
 * Feature: SSGEpub, Property 4: Books Collection Sorted Alphabetically
 * Validates: Requirements 2.5
 */

const fc = require('fast-check');
const { sortBooksAlphabetically } = require('../.eleventy.js');

// Arbitrary for a book object with title
const bookArb = fc.record({
  data: fc.record({
    title: fc.string({ minLength: 1, maxLength: 100 }),
    author: fc.string({ minLength: 1, maxLength: 50 }),
    cover: fc.webUrl(),
    downloadLinks: fc.array(
      fc.record({ url: fc.webUrl(), platform: fc.string({ minLength: 1 }) }),
      { minLength: 1, maxLength: 3 }
    )
  }),
  fileSlug: fc.string({ minLength: 1, maxLength: 50 })
});

// Arbitrary for array of books
const booksArrayArb = fc.array(bookArb, { minLength: 0, maxLength: 50 });

describe('Books Collection Sorting', () => {
  /**
   * Property 4: Books Collection Sorted Alphabetically
   * For any collection of books with random titles, the sorted collection
   * SHALL have each book's title lexicographically less than or equal to the next book's title.
   * Validates: Requirements 2.5
   */
  test('Property 4: Books are sorted alphabetically by title', () => {
    fc.assert(
      fc.property(booksArrayArb, (books) => {
        const sorted = sortBooksAlphabetically(books);
        
        // Check that result has same length as input
        expect(sorted.length).toBe(books.length);
        
        // Check that each title is <= the next title
        for (let i = 0; i < sorted.length - 1; i++) {
          const currentTitle = sorted[i].data?.title || '';
          const nextTitle = sorted[i + 1].data?.title || '';
          const comparison = currentTitle.localeCompare(nextTitle, 'vi');
          expect(comparison).toBeLessThanOrEqual(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Sorting is stable (preserves original array)
   */
  test('Sorting does not mutate original array', () => {
    fc.assert(
      fc.property(booksArrayArb, (books) => {
        const originalTitles = books.map(b => b.data?.title);
        sortBooksAlphabetically(books);
        const afterTitles = books.map(b => b.data?.title);
        
        // Original array should be unchanged
        expect(afterTitles).toEqual(originalTitles);
      }),
      { numRuns: 100 }
    );
  });
});
