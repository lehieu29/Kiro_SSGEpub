/**
 * Property-based tests for Book Card rendering
 * Feature: SSGEpub, Property 6: Book Card Contains Required Information
 * Validates: Requirements 2.7
 */

const fc = require('fast-check');
const { renderBookCard } = require('../.eleventy.js');

// Arbitrary for a book object with all required fields
const bookArb = fc.record({
  data: fc.record({
    title: fc.string({ minLength: 1, maxLength: 100 }),
    author: fc.string({ minLength: 1, maxLength: 50 }),
    cover: fc.webUrl(),
    description: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
    downloadLinks: fc.array(
      fc.record({ url: fc.webUrl(), platform: fc.string({ minLength: 1 }) }),
      { minLength: 1, maxLength: 3 }
    )
  }),
  fileSlug: fc.string({ minLength: 1, maxLength: 50 })
});

describe('Book Card Rendering', () => {
  /**
   * Property 6: Book Card Contains Required Information
   * For any book data with title, author, and cover, the rendered Book_Card HTML
   * SHALL contain all three pieces of information.
   * Validates: Requirements 2.7
   */
  test('Property 6: Book Card contains title, author, and cover', () => {
    fc.assert(
      fc.property(bookArb, (book) => {
        const result = renderBookCard(book);
        
        // HTML should contain the title
        expect(result.containsTitle).toBe(true);
        expect(result.html).toContain(book.data.title);
        
        // HTML should contain the author
        expect(result.containsAuthor).toBe(true);
        expect(result.html).toContain(book.data.author);
        
        // HTML should contain the cover URL
        expect(result.containsCover).toBe(true);
        expect(result.html).toContain(book.data.cover);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 6: Book Card has correct structure', () => {
    fc.assert(
      fc.property(bookArb, (book) => {
        const result = renderBookCard(book);
        
        // Should have book-card class
        expect(result.html).toContain('class="book-card');
        
        // Should have data-src for lazy loading
        expect(result.html).toContain('data-src=');
        
        // Should have link to detail page
        expect(result.html).toContain(`href="/books/${book.fileSlug}/"`);
        
        // Should have title in h2
        expect(result.html).toContain('<h2 class="book-card-title">');
        
        // Should have author in p
        expect(result.html).toContain('<p class="book-card-author">');
      }),
      { numRuns: 100 }
    );
  });

  test('Property 6: Book Card shows description overlay when present', () => {
    // Use a book with description
    const bookWithDescArb = fc.record({
      data: fc.record({
        title: fc.string({ minLength: 1, maxLength: 100 }),
        author: fc.string({ minLength: 1, maxLength: 50 }),
        cover: fc.webUrl(),
        description: fc.string({ minLength: 1, maxLength: 200 }),
        downloadLinks: fc.array(
          fc.record({ url: fc.webUrl(), platform: fc.string({ minLength: 1 }) }),
          { minLength: 1, maxLength: 3 }
        )
      }),
      fileSlug: fc.string({ minLength: 1, maxLength: 50 })
    });

    fc.assert(
      fc.property(bookWithDescArb, (book) => {
        const result = renderBookCard(book);
        
        // Should have overlay with description
        expect(result.html).toContain('book-card-overlay');
        expect(result.html).toContain(book.data.description);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 6: Book Card hides description overlay when not present', () => {
    // Use a book without description
    const bookWithoutDescArb = fc.record({
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

    fc.assert(
      fc.property(bookWithoutDescArb, (book) => {
        const result = renderBookCard(book);
        
        // Should NOT have overlay when no description
        expect(result.html).not.toContain('book-card-overlay');
      }),
      { numRuns: 100 }
    );
  });
});
