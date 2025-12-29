/**
 * Property-based tests for SEO meta tags
 * Feature: SSGEpub, Property 15: SEO Meta Tags Present
 * Validates: Requirements 7.1, 7.5
 */

const fc = require('fast-check');
const { generateSeoMetaTags, validateSeoMetaTags } = require('../src/js/seo.js');

// Arbitrary for site configuration
const siteDataArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 300 }),
  url: fc.webUrl()
});

// Arbitrary for page data (book page)
const pageDataArb = fc.record({
  title: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
  description: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
  cover: fc.option(fc.webUrl(), { nil: undefined }),
  url: fc.string({ minLength: 1, maxLength: 100 }).map(s => `/${s.replace(/[^a-z0-9]/gi, '-')}.html`),
  layout: fc.option(fc.constantFrom('base.njk', 'detail.njk', 'home.njk'), { nil: undefined })
});

// Arbitrary for book page data (always has title, description, cover)
const bookPageDataArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 200 }),
  description: fc.string({ minLength: 1, maxLength: 500 }),
  cover: fc.webUrl(),
  url: fc.string({ minLength: 1, maxLength: 100 }).map(s => `/books/${s.replace(/[^a-z0-9]/gi, '-')}.html`),
  layout: fc.constant('detail.njk')
});

describe('SEO Meta Tags', () => {
  /**
   * Property 15: SEO Meta Tags Present
   * For any book data, the rendered page HTML SHALL contain meta tags for
   * title, description, og:title, og:description, og:image, and canonical URL.
   * Validates: Requirements 7.1, 7.5
   */
  test('Property 15: SEO meta tags are present for all book pages', () => {
    fc.assert(
      fc.property(bookPageDataArb, siteDataArb, (pageData, siteData) => {
        const metaTags = generateSeoMetaTags(pageData, siteData);
        const validation = validateSeoMetaTags(metaTags);
        
        // All required meta tags must be present
        expect(validation.valid).toBe(true);
        expect(validation.missingTags).toHaveLength(0);
        
        // Title must contain page title and site name
        expect(metaTags.title).toContain(pageData.title);
        expect(metaTags.title).toContain(siteData.name);
        
        // Description must be present
        expect(metaTags.description).toBeTruthy();
        expect(metaTags.description.length).toBeGreaterThan(0);
        
        // Canonical URL must contain site URL
        expect(metaTags.canonical).toContain(siteData.url);
        expect(metaTags.canonical).toContain(pageData.url);
        
        // Open Graph tags must be present
        expect(metaTags['og:title']).toBe(pageData.title);
        expect(metaTags['og:description']).toBeTruthy();
        expect(metaTags['og:url']).toContain(siteData.url);
        expect(metaTags['og:image']).toBe(pageData.cover);
        
        // Twitter card tags must be present
        expect(metaTags['twitter:card']).toBe('summary_large_image');
        expect(metaTags['twitter:title']).toBe(pageData.title);
        expect(metaTags['twitter:description']).toBeTruthy();
        expect(metaTags['twitter:image']).toBe(pageData.cover);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Additional test: Pages without title should use site name
   */
  test('Pages without title use site name as fallback', () => {
    fc.assert(
      fc.property(siteDataArb, (siteData) => {
        const pageData = { url: '/index.html' };
        const metaTags = generateSeoMetaTags(pageData, siteData);
        
        // Title should be site name when no page title
        expect(metaTags.title).toBe(siteData.name);
        expect(metaTags['og:title']).toBe(siteData.name);
        expect(metaTags['twitter:title']).toBe(siteData.name);
        
        // Description should fall back to site description
        expect(metaTags.description).toBe(siteData.description);
      }),
      { numRuns: 100 }
    );
  });
});
