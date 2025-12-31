/**
 * Search Engine - Handles fuzzy search functionality using Fuse.js
 * Requirements: 4.2, 4.5, 4.6, 4.7
 */

class SearchEngine {
  constructor() {
    this.fuse = null;
    this.searchIndex = [];
    this.MAX_RESULTS = 5;
    this.fuseOptions = {
      keys: ['title', 'author', 'description', 'tags'],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2
    };
  }

  /**
   * Initialize Fuse.js with search index
   * Loads search-index.json and creates Fuse instance
   * @returns {Promise<void>}
   */
  async init() {
    try {
      const response = await fetch('/search-index.json');
      if (!response.ok) {
        throw new Error('Failed to load search index');
      }
      this.searchIndex = await response.json();
      
      // Initialize Fuse.js with the search index
      if (typeof Fuse !== 'undefined') {
        this.fuse = new Fuse(this.searchIndex, this.fuseOptions);
      }
      
      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Search initialization failed:', error.message);
    }
  }

  /**
   * Set up search input event listeners
   */
  setupEventListeners() {
    // Desktop search
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const searchResults = document.getElementById('search-results');
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleInput(e, searchResults));
      searchInput.addEventListener('focus', (e) => this.handleInput(e, searchResults));
    }
    
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    // Mobile search
    const mobileSearchInput = document.getElementById('mobile-search-input');
    const mobileSearchForm = document.getElementById('mobile-search-form');
    const mobileSearchResults = document.getElementById('mobile-search-results');
    const mobileSearchToggle = document.getElementById('mobile-search-toggle');
    const mobileSearchContainer = document.getElementById('mobile-search-container');
    
    if (mobileSearchInput) {
      mobileSearchInput.addEventListener('input', (e) => this.handleInput(e, mobileSearchResults));
      mobileSearchInput.addEventListener('focus', (e) => this.handleInput(e, mobileSearchResults));
    }
    
    if (mobileSearchForm) {
      mobileSearchForm.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    // Mobile search toggle
    if (mobileSearchToggle && mobileSearchContainer) {
      mobileSearchToggle.addEventListener('click', () => {
        mobileSearchContainer.classList.toggle('hidden');
        if (!mobileSearchContainer.classList.contains('hidden')) {
          mobileSearchInput?.focus();
        }
      });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#search-form') && searchResults) {
        searchResults.classList.add('hidden');
      }
      if (!e.target.closest('#mobile-search-form') && !e.target.closest('#mobile-search-toggle') && mobileSearchResults) {
        mobileSearchResults.classList.add('hidden');
      }
    });
  }

  /**
   * Handle input event for real-time search
   * @param {Event} event - Input event
   * @param {HTMLElement} resultsContainer - Container for results dropdown
   */
  handleInput(event, resultsContainer) {
    const query = event.target.value.trim();
    
    if (query.length < 2) {
      if (resultsContainer) {
        resultsContainer.classList.add('hidden');
      }
      return;
    }
    
    const results = this.search(query);
    this.renderResults(results, resultsContainer);
  }

  /**
   * Perform fuzzy search and return results
   * @param {string} query - Search query
   * @returns {Array} - Array of search results (max 5 items)
   */
  search(query) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    
    if (!this.fuse) {
      // Fallback: simple case-insensitive search if Fuse not available
      return this.fallbackSearch(query);
    }
    
    const results = this.fuse.search(query.trim());
    return results.slice(0, this.MAX_RESULTS);
  }

  /**
   * Fallback search when Fuse.js is not available
   * @param {string} query - Search query
   * @returns {Array} - Array of search results
   */
  fallbackSearch(query) {
    const lowerQuery = query.toLowerCase();
    const results = this.searchIndex
      .filter(item => {
        const titleMatch = item.title?.toLowerCase().includes(lowerQuery);
        const authorMatch = item.author?.toLowerCase().includes(lowerQuery);
        const descMatch = item.description?.toLowerCase().includes(lowerQuery);
        const tagsMatch = item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
        return titleMatch || authorMatch || descMatch || tagsMatch;
      })
      .map(item => ({ item, score: 0.5 }));
    
    return results.slice(0, this.MAX_RESULTS);
  }

  /**
   * Render search results in dropdown
   * @param {Array} results - Array of search results
   * @param {HTMLElement} container - Container element for results
   */
  renderResults(results, container) {
    if (!container) return;
    
    if (results.length === 0) {
      container.innerHTML = '<div class="p-4 text-light-secondary dark:text-dark-secondary">Không tìm thấy kết quả</div>';
      container.classList.remove('hidden');
      return;
    }
    
    const html = results.map(result => {
      const item = result.item;
      return `
        <a href="${item.url}" class="block p-3 hover:bg-light-bg dark:hover:bg-dark-bg transition-colors border-b border-light-border dark:border-dark-border last:border-b-0">
          <div class="font-medium text-light-text dark:text-dark-text">${this.escapeHtml(item.title)}</div>
          <div class="text-sm text-light-secondary dark:text-dark-secondary">${this.escapeHtml(item.author)}</div>
        </a>
      `;
    }).join('');
    
    container.innerHTML = html;
    container.classList.remove('hidden');
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} str - String to escape
   * @returns {string} - Escaped string
   */
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Handle search form submission
   * @param {Event} event - Submit event
   */
  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('input[name="q"]');
    const query = input?.value?.trim();
    
    if (query && query.length > 0) {
      // Navigate to search page with query parameter
      window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
  }
}

// Create global instance and initialize (browser only)
if (typeof window !== 'undefined' && typeof module === 'undefined') {
  const searchEngine = new SearchEngine();
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => searchEngine.init());
  } else {
    searchEngine.init();
  }
}

// Export for use in testing (Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SearchEngine };
}
