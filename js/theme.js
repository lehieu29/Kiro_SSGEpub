/**
 * Theme Manager - Handles dark/light mode switching and persistence
 * Requirements: 5.1, 5.3, 5.4, 5.5, 5.6
 */

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'ssgepub_theme';
    this.VALID_THEMES = ['light', 'dark'];
  }

  /**
   * Initialize theme on page load
   * Applies theme from localStorage or system preference
   */
  init() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    
    if (savedTheme && this.VALID_THEMES.includes(savedTheme)) {
      this.applyTheme(savedTheme);
    } else {
      // Use system preference or default to light
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = systemPrefersDark ? 'dark' : 'light';
      this.applyTheme(theme);
    }

    // Set up theme toggle button listener
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => this.toggle());
    }
  }

  /**
   * Get current theme
   * @returns {string} - Current theme ('light' or 'dark')
   */
  getTheme() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    if (savedTheme && this.VALID_THEMES.includes(savedTheme)) {
      return savedTheme;
    }
    // Fallback: check document class
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  /**
   * Set theme and persist to localStorage
   * @param {string} theme - Theme to set ('light' or 'dark')
   */
  setTheme(theme) {
    if (!this.VALID_THEMES.includes(theme)) {
      console.warn(`Invalid theme: ${theme}. Using 'light' as fallback.`);
      theme = 'light';
    }
    
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  /**
   * Toggle between light and dark mode
   */
  toggle() {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Apply theme class to document
   * @param {string} theme - Theme to apply ('light' or 'dark')
   */
  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

// Create global instance and initialize (browser only)
if (typeof window !== 'undefined' && typeof module === 'undefined') {
  const themeManager = new ThemeManager();
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => themeManager.init());
  } else {
    themeManager.init();
  }
}

// Export for use in testing (Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeManager };
}
