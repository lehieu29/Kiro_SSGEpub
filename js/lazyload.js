/**
 * Lazy Load Observer - Handles lazy loading of images using Intersection Observer
 * Requirements: 2.10, 10.1
 */

class LazyLoadObserver {
  constructor() {
    this.observer = null;
    this.options = {
      root: null, // viewport
      rootMargin: '50px', // load slightly before entering viewport
      threshold: 0.01
    };
  }

  /**
   * Initialize the Intersection Observer
   */
  init() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all images immediately
      this.loadAllImages();
      return;
    }

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, this.options);

    this.observeImages();
  }

  /**
   * Observe all images with data-src attribute
   */
  observeImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      if (this.observer) {
        this.observer.observe(img);
      }
    });
  }

  /**
   * Load image by setting src from data-src
   * @param {HTMLImageElement} img - Image element to load
   */
  loadImage(img) {
    const src = img.getAttribute('data-src');
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
      img.classList.add('loaded');
    }
  }

  /**
   * Fallback: Load all images immediately (for browsers without IntersectionObserver)
   */
  loadAllImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => this.loadImage(img));
  }

  /**
   * Disconnect the observer (cleanup)
   */
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Create global instance and initialize (browser only)
if (typeof window !== 'undefined' && typeof module === 'undefined') {
  const lazyLoadObserver = new LazyLoadObserver();
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => lazyLoadObserver.init());
  } else {
    lazyLoadObserver.init();
  }
}

// Export for use in testing (Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LazyLoadObserver };
}
