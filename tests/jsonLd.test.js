/**
 * Property-based tests for JSON-LD Structured Data
 * Feature: SSGEpub, Property 16: JSON-LD Structured Data Valid
 * Validates: Requirements 7.4
 */

const fc = require('fast-check');
const { generateJsonLd } = require('../.eleventy.js');

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
  })
});

// Arbitrary for book with tags
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
  })
});

describe('JSON-LD Structured Data', () => {
  /**
   * Property 16: JSON-LD Structured Data Valid
   * For any book data, the rendered detail page SHALL contain valid JSON-LD
   * with @type "Book" and properties matching the book's title, author, and cover.
   * Validates: Requirements 7.4
   */
  test('Property 16: JSON-LD has valid schema.org context and Book type', () => {
    fc.assert(
      fc.property(bookArb, (book) => {
        const result = generateJsonLd(book);
        
        // JSON-LD should have valid schema.org context
        expect(result.jsonLd["@context"]).toBe("https://schema.org");
        
        // JSON-LD should have Book type
        expect(result.jsonLd["@type"]).toBe("Book");
        
        // Should be valid
        expect(result.isValid).toBe(true);
        expect(result.hasRequiredFields).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 16: JSON-LD contains book name matching title', () => {
    fc.assert(
      fc.property(bookArb, (book) => {
        const result = generateJsonLd(book);
        
        // JSON-LD name should match book title
        expect(result.containsTitle).toBe(true);
        expect(result.jsonLd.name).toBe(book.data.title);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 16: JSON-LD contains author with Person type', () => {
    fc.assert(
      fc.property(bookArb, (book) => {
        const result = generateJsonLd(book);
        
        // JSON-LD author should be a Person type
        expect(result.jsonLd.author["@type"]).toBe("Person");
        
        // Author name should match book author
        expect(result.containsAuthor).toBe(true);
        expect(result.jsonLd.author.name).toBe(book.data.author);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 16: JSON-LD contains image matching cover', () => {
    fc.assert(
      fc.property(bookArb, (book) => {
        const result = generateJsonLd(book);
        
        // JSON-LD image should match book cover
        expect(result.containsImage).toBe(true);
        expect(result.jsonLd.image).toBe(book.data.cover);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 16: JSON-LD includes genre when tags are present', () => {
    fc.assert(
      fc.property(bookWithTagsArb, (book) => {
        const result = generateJsonLd(book);
        
        // JSON-LD should have genre array matching tags
        expect(result.jsonLd.genre).toBeDefined();
        expect(result.jsonLd.genre).toEqual(book.data.tags);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 16: JSON-LD is valid JSON structure', () => {
    fc.assert(
      fc.property(bookArb, (book) => {
        const result = generateJsonLd(book);
        
        // Should be able to stringify and parse back
        const jsonString = JSON.stringify(result.jsonLd);
        const parsed = JSON.parse(jsonString);
        
        expect(parsed["@context"]).toBe("https://schema.org");
        expect(parsed["@type"]).toBe("Book");
        expect(parsed.name).toBe(book.data.title);
        expect(parsed.author.name).toBe(book.data.author);
        expect(parsed.image).toBe(book.data.cover);
      }),
      { numRuns: 100 }
    );
  });
});
