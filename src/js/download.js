/**
 * Download Manager - Handles download logic with Cloudflare API integration
 * Requirements: 3.6, 3.7, 3.8, 3.9, 3.10
 */

class DownloadManager {
  constructor() {
    this.API_URL = 'https://your-worker.workers.dev/api/get-link-platform';
    this.STORAGE_KEY = 'ssgepub_platform_index';
    this.downloadLinks = [];
    this.button = null;
  }

  /**
   * Initialize with download links from page data
   * @param {Array} links - Array of download link objects
   */
  init(links) {
    this.downloadLinks = links || [];
    this.button = document.getElementById('download-btn');
    
    if (this.button) {
      this.button.addEventListener('click', () => this.handleDownload());
    }
  }

  /**
   * Get platform index from API or cache
   * @returns {Promise<number>} - Platform index
   */
  async getPlatformIndex() {
    // Check sessionStorage cache first
    const cached = sessionStorage.getItem(this.STORAGE_KEY);
    if (cached !== null) {
      return parseInt(cached, 10);
    }

    try {
      this.setLoading(true);
      const response = await fetch(this.API_URL);
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      const index = data.platformIndex || 0;
      
      // Cache in sessionStorage
      sessionStorage.setItem(this.STORAGE_KEY, index.toString());
      
      return index;
    } catch (error) {
      console.warn('API failed, using fallback:', error.message);
      // Fallback to index 0 on API failure
      return 0;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get selected download link based on platform index
   * @returns {Promise<Object>} - Download link object
   */
  async getDownloadLink() {
    if (!this.downloadLinks || this.downloadLinks.length === 0) {
      return null;
    }

    const index = await this.getPlatformIndex();
    // Ensure index is within bounds, fallback to first link
    const safeIndex = Math.min(index, this.downloadLinks.length - 1);
    return this.downloadLinks[safeIndex];
  }

  /**
   * Handle download button click
   */
  async handleDownload() {
    const link = await this.getDownloadLink();
    
    if (link && link.url) {
      // Open link in new tab
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } else {
      console.error('No download link available');
    }
  }

  /**
   * Set button loading state
   * @param {boolean} isLoading - Loading state
   */
  setLoading(isLoading) {
    if (this.button) {
      this.button.disabled = isLoading;
      this.button.classList.toggle('loading', isLoading);
    }
  }
}

// Export for use in browser and testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DownloadManager };
}
