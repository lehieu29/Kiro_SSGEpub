/**
 * Property-based tests for frontmatter validation
 * Feature: SSGEpub, Property 1 & 2: Frontmatter Validation
 * Validates: Requirements 1.2, 1.3, 1.5
 */

const fc = require('fast-check');
const { validateBookData, ERROR_MESSAGES } = require('../.eleventy.js');

// Arbitrary for valid download link
const downloadLinkArb = fc.record({
  url: fc.webUrl(),
  platform: fc.string({ minLength: 1, maxLength: 50 })
});

// Arbitrary for valid frontmatter (all required fields present)
const validFrontmatterArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  author: fc.string({ minLength: 1, maxLength: 100 }),
  cover: fc.webUrl(),
  downloadLinks: fc.array(downloadLinkArb, { minLength: 1, maxLength: 5 }),
  // Optional fields
  description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }), { nil: undefined }),
  publishDate: fc.option(fc.date(), { nil: undefined })
});

// Arbitrary for invalid frontmatter (missing at least one required field)
const invalidFrontmatterArb = fc.oneof(
  // Missing title
  fc.record({
    author: fc.string({ minLength: 1 }),
    cover: fc.webUrl(),
    downloadLinks: fc.array(downloadLinkArb, { minLength: 1 })
  }),
  // Missing author
  fc.record({
    title: fc.string({ minLength: 1 }),
    cover: fc.webUrl(),
    downloadLinks: fc.array(downloadLinkArb, { minLength: 1 })
  }),
  // Missing cover
  fc.record({
    title: fc.string({ minLength: 1 }),
    author: fc.string({ minLength: 1 }),
    downloadLinks: fc.array(downloadLinkArb, { minLength: 1 })
  }),
  // Missing downloadLinks
  fc.record({
    title: fc.string({ minLength: 1 }),
    author: fc.string({ minLength: 1 }),
    cover: fc.webUrl()
  }),
  // Empty downloadLinks array
  fc.record({
    title: fc.string({ minLength: 1 }),
    author: fc.string({ minLength: 1 }),
    cover: fc.webUrl(),
    downloadLinks: fc.constant([])
  })
);

describe('Frontmatter Validation', () => {
  /**
   * Property 1: Frontmatter Validation Rejects Invalid Data
   * For any frontmatter object missing one or more required fields,
   * the validation function SHALL return an invalid result with descriptive error messages.
   * Validates: Requirements 1.2, 1.3
   */
  test('Property 1: Invalid frontmatter is rejected with descriptive errors', () => {
    fc.assert(
      fc.property(invalidFrontmatterArb, (data) => {
        const result = validateBookData(data);
        
        // Must be invalid
        expect(result.valid).toBe(false);
        
        // Must have at least one error
        expect(result.errors.length).toBeGreaterThan(0);
        
        // Errors must be descriptive (from ERROR_MESSAGES)
        const validErrorMessages = Object.values(ERROR_MESSAGES);
        result.errors.forEach(error => {
          expect(validErrorMessages).toContain(error);
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Valid Frontmatter Passes Validation
   * For any frontmatter object containing all required fields,
   * the validation function SHALL return a valid result regardless of optional fields.
   * Validates: Requirements 1.2, 1.5
   */
  test('Property 2: Valid frontmatter passes validation', () => {
    fc.assert(
      fc.property(validFrontmatterArb, (data) => {
        const result = validateBookData(data);
        
        // Must be valid
        expect(result.valid).toBe(true);
        
        // Must have no errors
        expect(result.errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });
});
