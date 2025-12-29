/**
 * Property-based tests for SearchEngine
 * Feature: SSGEpub, Property 11 & 12: Search Results
 * Validates: Requirements 4.5, 4.7
 * @jest-environment jsdom
 */

const fc = require('fast-check');

// Mock fetch before requiring SearchEngine
global.fetch = jest.fn();

// Mock Fuse.js
class MockFuse {
  constructor(data, options) {
    this.data = data;
    this.options = options;
  }
  
  search(query) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    
    const lowerQuery = query.toLowerCase();
    const results = this.data
      .filter(item => {
        const titleMatch = item.title?.toLowerCase().includes(lowerQuery);
        const authorMatch = item.author?.toLowerCase().includes(lowerQuery);
        const descMatch = item.description?.toLowerCase().includes(lowerQuery);
        const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
        return titleMatch || authorMatch || descMatch || tagsMatch;
      })
      .map(item => ({ 
        item, 
        score: this.calculateScore(item, lowerQuery)
      }));
    
    return results.sort((a, b) => a.score - b.score);
  }
  
  calculateScore(item, query) {
    // Lower score = better match (Fuse.js convention)
    if (item.title?.toLowerCase().includes(query)) return 0.1;
    if (item.author?.toLowerCase().includes(query)) return 0.2;
    if (item.description?.toLowerCase().includes(query)) return 0.3;
    if (item.tags?.some(tag => tag.toLowerCase().includes(query))) return 0.4;
    return 0.5;
  }
}

global.Fuse = MockFuse;

// Now require SearchEngine after mocks are set up
const { SearchEngine } = require('../src/js/search.js');

// Arbitrary generators for search index items
const searchIndexItemArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 50 }),
  author: fc.string({ minLength: 1, maxLength: 30 }),
  description: fc.string({ maxLength: 100 }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
  url: fc.string({ minLength: 1, maxLength: 50 }).map(s => `/books/${s}.html`)
});

const searchIndexArb = fc.array(searchIndexItemArb, { minLength: 0, maxLength: 50 });

describe('SearchEngine Property Tests', () => {
  let searchEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    searchEngine = new SearchEngine();
  });

  /**
   * Property 11: Search Results Limited to Maximum
   * For any search query against any search index, the returned results 
   * SHALL contain at most 5 items.
   * Validates: Requirements 4.5
   */
  test('Property 11: Search Results Limited to Maximum', () => {
    fc.assert(
      fc.property(
        searchIndexArb,
        fc.string({ minLength: 1, maxLength: 20 }),
        (searchIndex, query) => {
          // Set up search engine with the generated index
          searchEngine.searchIndex = searchIndex;
          searchEngine.fuse = new MockFuse(searchIndex, searchEngine.fuseOptions);
          
          // Perform search
          const results = searchEngine.search(query);
          
          // Results should never exceed MAX_RESULTS (5)
          expect(results.length).toBeLessThanOrEqual(searchEngine.MAX_RESULTS);
          expect(results.length).toBeLessThanOrEqual(5);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Search Results Are Relevant
   * For any search query, all returned results SHALL have a relevance score 
   * indicating the query matches at least one of: title, author, description, or tags.
   * Validates: Requirements 4.7
   */
  test('Property 12: Search Results Are Relevant', () => {
    // Generate search index with known searchable content
    const searchableIndexArb = fc.array(
      fc.record({
        title: fc.string({ minLength: 2, maxLength: 50 }),
        author: fc.string({ minLength: 2, maxLength: 30 }),
        description: fc.string({ minLength: 2, maxLength: 100 }),
        tags: fc.array(fc.string({ minLength: 2, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        url: fc.string({ minLength: 1, maxLength: 50 }).map(s => `/books/${s}.html`)
      }),
      { minLength: 1, maxLength: 20 }
    );

    fc.assert(
      fc.property(
        searchableIndexArb,
        (searchIndex) => {
          // Pick a random item and use part of its title as query
          const randomItem = searchIndex[Math.floor(Math.random() * searchIndex.length)];
          const query = randomItem.title.substring(0, Math.min(3, randomItem.title.length));
          
          if (query.length < 2) return true; // Skip if query too short
          
          // Set up search engine
          searchEngine.searchIndex = searchIndex;
          searchEngine.fuse = new MockFuse(searchIndex, searchEngine.fuseOptions);
          
          // Perform search
          const results = searchEngine.search(query);
          
          // All results should have a score (indicating relevance)
          results.forEach(result => {
            expect(result).toHaveProperty('score');
            expect(typeof result.score).toBe('number');
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(1);
            
            // Verify the result item matches the query in at least one field
            const item = result.item;
            const lowerQuery = query.toLowerCase();
            const matchesTitle = item.title?.toLowerCase().includes(lowerQuery);
            const matchesAuthor = item.author?.toLowerCase().includes(lowerQuery);
            const matchesDescription = item.description?.toLowerCase().includes(lowerQuery);
            const matchesTags = item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
            
            const hasMatch = matchesTitle || matchesAuthor || matchesDescription || matchesTags;
            expect(hasMatch).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional unit tests for edge cases
  describe('Unit Tests', () => {
    test('empty query returns empty results', () => {
      searchEngine.searchIndex = [{ title: 'Test', author: 'Author', url: '/test.html' }];
      searchEngine.fuse = new MockFuse(searchEngine.searchIndex, searchEngine.fuseOptions);
      
      expect(searchEngine.search('')).toEqual([]);
      expect(searchEngine.search('   ')).toEqual([]);
    });

    test('search returns matching items', () => {
      const index = [
        { title: 'Harry Potter', author: 'J.K. Rowling', description: 'Magic', tags: ['fantasy'], url: '/harry.html' },
        { title: 'Lord of the Rings', author: 'Tolkien', description: 'Epic', tags: ['fantasy'], url: '/lotr.html' }
      ];
      searchEngine.searchIndex = index;
      searchEngine.fuse = new MockFuse(index, searchEngine.fuseOptions);
      
      const results = searchEngine.search('Harry');
      expect(results.length).toBe(1);
      expect(results[0].item.title).toBe('Harry Potter');
    });

    test('search by author works', () => {
      const index = [
        { title: 'Book 1', author: 'Nguyễn Văn A', description: '', tags: [], url: '/book1.html' },
        { title: 'Book 2', author: 'Trần Văn B', description: '', tags: [], url: '/book2.html' }
      ];
      searchEngine.searchIndex = index;
      searchEngine.fuse = new MockFuse(index, searchEngine.fuseOptions);
      
      const results = searchEngine.search('Nguyễn');
      expect(results.length).toBe(1);
      expect(results[0].item.author).toBe('Nguyễn Văn A');
    });

    test('search by tags works', () => {
      const index = [
        { title: 'Book 1', author: 'Author', description: '', tags: ['romance', 'drama'], url: '/book1.html' },
        { title: 'Book 2', author: 'Author', description: '', tags: ['action'], url: '/book2.html' }
      ];
      searchEngine.searchIndex = index;
      searchEngine.fuse = new MockFuse(index, searchEngine.fuseOptions);
      
      const results = searchEngine.search('romance');
      expect(results.length).toBe(1);
      expect(results[0].item.tags).toContain('romance');
    });

    test('results are limited to MAX_RESULTS', () => {
      const index = Array.from({ length: 20 }, (_, i) => ({
        title: `Test Book ${i}`,
        author: 'Test Author',
        description: 'Test description',
        tags: ['test'],
        url: `/book${i}.html`
      }));
      searchEngine.searchIndex = index;
      searchEngine.fuse = new MockFuse(index, searchEngine.fuseOptions);
      
      const results = searchEngine.search('Test');
      expect(results.length).toBeLessThanOrEqual(5);
    });
  });
});
