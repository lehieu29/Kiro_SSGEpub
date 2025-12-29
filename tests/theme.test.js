/**
 * Property-based tests for ThemeManager
 * Feature: SSGEpub, Property 13 & 14: Theme Toggle and Persistence
 * Validates: Requirements 5.3, 5.4, 5.5
 * @jest-environment jsdom
 */

const fc = require('fast-check');

// Mock localStorage before requiring ThemeManager
const localStorageMock = (() => {
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
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((i) => Object.keys(store)[i] || null)
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock matchMedia before requiring ThemeManager
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Now require ThemeManager after mocks are set up
const { ThemeManager } = require('../src/js/theme.js');

describe('ThemeManager Property Tests', () => {
  let themeManager;

  beforeEach(() => {
    // Reset DOM
    document.documentElement.classList.remove('dark');
    // Clear localStorage mock
    localStorageMock.clear();
    jest.clearAllMocks();
    // Create fresh instance
    themeManager = new ThemeManager();
  });

  /**
   * Property 13: Theme Toggle Round-Trip
   * For any initial theme state, toggling the theme twice SHALL return to the original theme state.
   * Validates: Requirements 5.3
   */
  test('Property 13: Theme Toggle Round-Trip', () => {
    const themeArb = fc.constantFrom('light', 'dark');

    fc.assert(
      fc.property(themeArb, (initialTheme) => {
        // Set initial theme
        themeManager.setTheme(initialTheme);
        const beforeToggle = themeManager.getTheme();
        
        // Toggle twice
        themeManager.toggle();
        themeManager.toggle();
        
        const afterDoubleToggle = themeManager.getTheme();
        
        // Should return to original state
        expect(afterDoubleToggle).toBe(beforeToggle);
        expect(afterDoubleToggle).toBe(initialTheme);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 14: Theme Persistence Round-Trip
   * For any theme value ('light' or 'dark'), setting the theme and then retrieving it 
   * from localStorage SHALL return the same value.
   * Validates: Requirements 5.4, 5.5
   */
  test('Property 14: Theme Persistence Round-Trip', () => {
    const themeArb = fc.constantFrom('light', 'dark');

    fc.assert(
      fc.property(themeArb, (theme) => {
        // Set theme
        themeManager.setTheme(theme);
        
        // Retrieve from localStorage directly
        const storedTheme = localStorage.getItem(themeManager.STORAGE_KEY);
        
        // Should match the set theme
        expect(storedTheme).toBe(theme);
        
        // Create new instance and verify it reads the same theme
        const newManager = new ThemeManager();
        const retrievedTheme = newManager.getTheme();
        
        expect(retrievedTheme).toBe(theme);
      }),
      { numRuns: 100 }
    );
  });

  // Additional unit tests for edge cases
  describe('Unit Tests', () => {
    test('toggle switches from light to dark', () => {
      themeManager.setTheme('light');
      themeManager.toggle();
      expect(themeManager.getTheme()).toBe('dark');
    });

    test('toggle switches from dark to light', () => {
      themeManager.setTheme('dark');
      themeManager.toggle();
      expect(themeManager.getTheme()).toBe('light');
    });

    test('setTheme applies dark class to document', () => {
      themeManager.setTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('setTheme removes dark class for light theme', () => {
      themeManager.setTheme('dark');
      themeManager.setTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    test('invalid theme falls back to light', () => {
      themeManager.setTheme('invalid');
      expect(themeManager.getTheme()).toBe('light');
    });
  });
});
