/**
 * SEO Meta Tags Generator
 * Generates SEO meta tags for pages
 */

/**
 * Generate SEO meta tags object from page data
 * @param {Object} pageData - Page data object
 * @param {Object} siteData - Site configuration data
 * @returns {Object} - SEO meta tags object
 */
function generateSeoMetaTags(pageData, siteData) {
  const title = pageData.title ? `${pageData.title} | ${siteData.name}` : siteData.name;
  const description = pageData.description || siteData.description;
  const canonicalUrl = `${siteData.url}${pageData.url || ''}`;
  const ogType = pageData.layout === 'detail.njk' ? 'book' : 'website';
  
  return {
    title,
    description,
    canonical: canonicalUrl,
    'og:title': pageData.title || siteData.name,
    'og:description': description,
    'og:type': ogType,
    'og:url': canonicalUrl,
    'og:image': pageData.cover || null,
    'twitter:card': 'summary_large_image',
    'twitter:title': pageData.title || siteData.name,
    'twitter:description': description,
    'twitter:image': pageData.cover || null
  };
}

/**
 * Validate that all required SEO meta tags are present
 * @param {Object} metaTags - Meta tags object
 * @returns {Object} - { valid: boolean, missingTags: string[] }
 */
function validateSeoMetaTags(metaTags) {
  const requiredTags = [
    'title',
    'description',
    'canonical',
    'og:title',
    'og:description',
    'og:url'
  ];
  
  const missingTags = requiredTags.filter(tag => !metaTags[tag]);
  
  return {
    valid: missingTags.length === 0,
    missingTags
  };
}

// Export for Node.js (testing) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateSeoMetaTags, validateSeoMetaTags };
}
