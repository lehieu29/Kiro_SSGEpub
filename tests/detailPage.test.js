/**
 * Property-based tests for Detail Page
 * Feature: SSGEpub, Property 7 & 8: Detail Page URL and Metadata
 * Validates: Requirements 3.1, 3.2, 3.3
 */

const fc = require('fast-check');
const { generateDetailPageUrl, renderDetailPageMetadata } = require('../.eleventy.js');

// Arbitrary for file slug (alphanumeric with hyphens)
const fileSlugArb = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
  { minLength: 1, maxLength: 50 }
).filter(s => !s.startsWith('-') && !s.endsWith('-') && !s.includes('--'));

// Arbitrary for a book object with all required fields
const bookArb = fc.record({
  data: fc.record({
    title: fc.string({ minLength: 1, maxLength: 100 }),
    author: fc.string({ minLength: 1, maxLength: 50 }),
    cover: fc.webUrl(),
    description: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
    tags: fc.option(
      fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
      { nil: undefined }
    ),
    downloadLinks: fc.array(
      fc.record({ url: fc.webUrl(), platform: fc.string({ minLength: 1 }) }),
      { minLength: 1, maxLength: 3 }
    )
  }),
  fileSlug: fileSlugArb
});

// Arbitrary for book with tags (always has tags)
const bookWithTagsArb = fc.record({
  data: fc.record({
    title: fc.string({ minLength: 1, maxLength: 100 }),
    author: fc.string({ minLength: 1, maxLength: 50 }),
    cover: fc.webUrl(),
    description: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
    downloadLinks: fc.array(
      fc.record({ url: fc.webUrl(), platform: fc.string({ minLength: 1 }) }),
      { minLength: 1, maxLength: 3 }
    )
  }),
  fileSlug: fileSlugArb
});

describe('Detail Page', () => {
  /**
   * Property 7: Detail Page URL Follows Slug Pattern
   * For any book with a title, the generated detail page URL SHALL be
   * /books/[slugified-title].html where the slug is derived from the title.
   * Validates: Requirements 3.1
   */
  test('Property 7: Detail page URL follows /books/[slug]/index.html pattern', () => {
    fc.assert(
      fc.property(fileSlugArb, (fileSlug) => {
        const url = generateDetailPageUrl(fileSlug);
        
        // URL should start with /books/
        expect(url).toMatch(/^\/books\//);
        
        // URL should end with /index.html
        expect(url).toMatch(/\/index\.html$/);
        
        // URL should contain the file slug
        expect(url).toContain(fileSlug);
        
        // URL should follow exact pattern
        expect(url).toBe(`/books/${fileSlug}/index.html`);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Detail Page Contains Book Metadata
   * For any book data, the rendered detail page HTML SHALL contain the cover image,
   * title, author, tags (if present), and breadcrumb with the book title.
   * Validates: Requirements 3.2, 3.3
   */
  test('Property 8: Detail page contains cover, title, author, and breadcrumb', () => {
    fc.assert(
      fc.property(bookArb, (book) => {
        const result = renderDetailPageMetadata(book);
        
        // HTML should contain the cover image URL
        expect(result.containsCover).toBe(true);
        expect(result.html).toContain(book.data.cover);
        
        // HTML should contain the title
        expect(result.containsTitle).toBe(true);
        expect(result.html).toContain(book.data.title);
        
        // HTML should contain the author
        expect(result.containsAuthor).toBe(true);
        expect(result.html).toContain(book.data.author);
        
        // HTML should contain breadcrumb with "Trang chủ" and title
        expect(result.containsBreadcrumb).toBe(true);
        expect(result.html).toContain('Trang chủ');
      }),
      { numRuns: 100 }
    );
  });

  test('Property 8: Detail page contains tags when present', () => {
    fc.assert(
      fc.property(bookWithTagsArb, (book) => {
        const result = renderDetailPageMetadata(book);
        
        // HTML should contain all tags
        expect(result.containsTags).toBe(true);
        book.data.tags.forEach(tag => {
          expect(result.html).toContain(tag);
        });
        
        // HTML should have detail-tags container
        expect(result.html).toContain('detail-tags');
      }),
      { numRuns: 100 }
    );
  });

  test('Property 8: Detail page has correct structure', () => {
    fc.assert(
      fc.property(bookArb, (book) => {
        const result = renderDetailPageMetadata(book);
        
        // Should have detail-container class
        expect(result.html).toContain('class="detail-container"');
        
        // Should have breadcrumb navigation
        expect(result.html).toContain('class="breadcrumb"');
        expect(result.html).toContain('aria-label="Breadcrumb"');
        
        // Should have detail-header
        expect(result.html).toContain('class="detail-header"');
        
        // Should have detail-cover
        expect(result.html).toContain('class="detail-cover"');
        
        // Should have detail-info
        expect(result.html).toContain('class="detail-info"');
        
        // Should have detail-title
        expect(result.html).toContain('class="detail-title"');
        
        // Should have detail-author
        expect(result.html).toContain('class="detail-author"');
      }),
      { numRuns: 100 }
    );
  });
});
