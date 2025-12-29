/**
 * Property-based tests for DownloadManager
 * Feature: SSGEpub, Property 9: Download Manager Fallback on API Failure
 * Validates: Requirements 3.9
 * @jest-environment jsdom
 */

const fc = require('fast-check');

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock fetch to simulate API failure
global.fetch = jest.fn();

// Mock window.open
window.open = jest.fn();

// Mock console.warn to suppress expected warnings
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});
afterAll(() => {
  console.warn = originalWarn;
});

const { DownloadManager } = require('../src/js/download.js');

describe('DownloadManager Property Tests', () => {
  let downloadManager;

  beforeEach(() => {
    // Clear mocks
    sessionStorageMock.clear();
    jest.clearAllMocks();
    global.fetch.mockReset();
    
    // Create fresh instance
    downloadManager = new DownloadManager();
  });

  /**
   * Property 9: Download Manager Fallback on API Failure
   * For any downloadLinks array with at least one item, when the API call fails,
   * the Download_Manager SHALL return downloadLinks[0].
   * Validates: Requirements 3.9
   */
  test('Property 9: Download Manager Fallback on API Failure', async () => {
    // Arbitrary for generating download link objects
    const downloadLinkArb = fc.record({
      url: fc.webUrl(),
      platform: fc.string({ minLength: 1, maxLength: 20 })
    });

    // Generate non-empty arrays of download links
    const downloadLinksArb = fc.array(downloadLinkArb, { minLength: 1, maxLength: 10 });

    await fc.assert(
      fc.asyncProperty(downloadLinksArb, async (links) => {
        // Setup: API always fails
        global.fetch.mockRejectedValue(new Error('Network error'));
        
        // Clear any cached value
        sessionStorageMock.clear();
        
        // Initialize with generated links
        downloadManager.init(links);
        
        // Get download link (should fallback to first link)
        const result = await downloadManager.getDownloadLink();
        
        // Should return the first link (index 0) on API failure
        expect(result).toEqual(links[0]);
      }),
      { numRuns: 100 }
    );
  });

  // Additional unit tests for edge cases
  describe('Unit Tests', () => {
    test('returns null when no download links provided', async () => {
      downloadManager.init([]);
      const result = await downloadManager.getDownloadLink();
      expect(result).toBeNull();
    });

    test('returns null when init called with undefined', async () => {
      downloadManager.init(undefined);
      const result = await downloadManager.getDownloadLink();
      expect(result).toBeNull();
    });

    test('uses cached platform index from sessionStorage', async () => {
      const links = [
        { url: 'https://example.com/1', platform: 'Platform1' },
        { url: 'https://example.com/2', platform: 'Platform2' }
      ];
      
      // Pre-cache index 1
      sessionStorageMock.setItem('ssgepub_platform_index', '1');
      
      downloadManager.init(links);
      const result = await downloadManager.getDownloadLink();
      
      // Should use cached index (1) and return second link
      expect(result).toEqual(links[1]);
      // Fetch should not be called when cache exists
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('caches API response in sessionStorage', async () => {
      const links = [
        { url: 'https://example.com/1', platform: 'Platform1' },
        { url: 'https://example.com/2', platform: 'Platform2' }
      ];
      
      // Mock successful API response
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ platformIndex: 1 })
      });
      
      downloadManager.init(links);
      await downloadManager.getDownloadLink();
      
      // Should cache the result
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('ssgepub_platform_index', '1');
    });

    test('handles API returning non-ok response', async () => {
      const links = [
        { url: 'https://example.com/1', platform: 'Platform1' },
        { url: 'https://example.com/2', platform: 'Platform2' }
      ];
      
      // Mock failed API response (non-ok status)
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500
      });
      
      downloadManager.init(links);
      const result = await downloadManager.getDownloadLink();
      
      // Should fallback to first link
      expect(result).toEqual(links[0]);
    });

    test('handles index out of bounds by using last available link', async () => {
      const links = [
        { url: 'https://example.com/1', platform: 'Platform1' }
      ];
      
      // Mock API returning index beyond array bounds
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ platformIndex: 5 })
      });
      
      downloadManager.init(links);
      const result = await downloadManager.getDownloadLink();
      
      // Should clamp to last available index (0)
      expect(result).toEqual(links[0]);
    });

    test('handleDownload opens link in new tab', async () => {
      const links = [
        { url: 'https://example.com/download', platform: 'Platform1' }
      ];
      
      global.fetch.mockRejectedValue(new Error('API error'));
      
      downloadManager.init(links);
      await downloadManager.handleDownload();
      
      expect(window.open).toHaveBeenCalledWith(
        'https://example.com/download',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });
});
