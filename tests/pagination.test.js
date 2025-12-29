/**
 * Property-based tests for pagination
 * Feature: SSGEpub, Property 5: Pagination Respects Size Limit
 * Validates: Requirements 2.6
 */

const fc = require('fast-check');
const { paginateItems } = require('../.eleventy.js');

// Arbitrary for a book object
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

// Arbitrary for array of books (0 to 100 items)
const booksArrayArb = fc.array(bookArb, { minLength: 0, maxLength: 100 });

// Arbitrary for page size (1 to 20, typical pagination sizes)
const pageSizeArb = fc.integer({ min: 1, max: 20 });

describe('Pagination', () => {
  /**
   * Property 5: Pagination Respects Size Limit
   * For any collection of N books and pagination size S, each page SHALL contain
   * at most S items, and the total items across all pages SHALL equal N.
   * Validates: Requirements 2.6
   */
  test('Property 5: Each page contains at most pageSize items', () => {
    fc.assert(
      fc.property(booksArrayArb, pageSizeArb, (books, pageSize) => {
        const pages = paginateItems(books, pageSize);
        
        // Each page should have at most pageSize items
        pages.forEach((page, index) => {
          expect(page.length).toBeLessThanOrEqual(pageSize);
        });
      }),
      { numRuns: 100 }
    );
  });

  test('Property 5: Total items across all pages equals original count', () => {
    fc.assert(
      fc.property(booksArrayArb, pageSizeArb, (books, pageSize) => {
        const pages = paginateItems(books, pageSize);
        
        // Total items across all pages should equal original count
        const totalItems = pages.reduce((sum, page) => sum + page.length, 0);
        expect(totalItems).toBe(books.length);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 5: All pages except last are full', () => {
    fc.assert(
      fc.property(booksArrayArb, pageSizeArb, (books, pageSize) => {
        const pages = paginateItems(books, pageSize);
        
        // All pages except the last should be full (have exactly pageSize items)
        // unless there are no items
        if (books.length > 0 && pages.length > 1) {
          for (let i = 0; i < pages.length - 1; i++) {
            expect(pages[i].length).toBe(pageSize);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  test('Property 5: Number of pages is correct', () => {
    fc.assert(
      fc.property(booksArrayArb, pageSizeArb, (books, pageSize) => {
        const pages = paginateItems(books, pageSize);
        
        // Number of pages should be ceil(N / S) or 1 if empty
        const expectedPages = books.length === 0 ? 1 : Math.ceil(books.length / pageSize);
        expect(pages.length).toBe(expectedPages);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 5: Items preserve order across pages', () => {
    fc.assert(
      fc.property(booksArrayArb, pageSizeArb, (books, pageSize) => {
        const pages = paginateItems(books, pageSize);
        
        // Flatten pages and compare with original
        const flattened = pages.flat();
        expect(flattened).toEqual(books);
      }),
      { numRuns: 100 }
    );
  });
});
