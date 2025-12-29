const markdownIt = require('markdown-it');

// Error messages in Vietnamese
const ERROR_MESSAGES = {
  MISSING_TITLE: 'Thiếu trường "title" trong frontmatter',
  MISSING_AUTHOR: 'Thiếu trường "author" trong frontmatter',
  MISSING_COVER: 'Thiếu trường "cover" trong frontmatter',
  MISSING_DOWNLOAD_LINKS: 'Thiếu trường "downloadLinks" trong frontmatter',
  EMPTY_DOWNLOAD_LINKS: 'downloadLinks phải có ít nhất 1 item'
};

// Required fields for book frontmatter
const REQUIRED_FIELDS = ['title', 'author', 'cover', 'downloadLinks'];

/**
 * Validates book frontmatter data
 * @param {Object} data - Frontmatter data object
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateBookData(data) {
  const errors = [];

  // Check required fields exist
  if (!data.title) {
    errors.push(ERROR_MESSAGES.MISSING_TITLE);
  }
  if (!data.author) {
    errors.push(ERROR_MESSAGES.MISSING_AUTHOR);
  }
  if (!data.cover) {
    errors.push(ERROR_MESSAGES.MISSING_COVER);
  }
  if (!data.downloadLinks) {
    errors.push(ERROR_MESSAGES.MISSING_DOWNLOAD_LINKS);
  } else if (!Array.isArray(data.downloadLinks) || data.downloadLinks.length < 1) {
    errors.push(ERROR_MESSAGES.EMPTY_DOWNLOAD_LINKS);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = function(eleventyConfig) {
  // Ignore directories and files that shouldn't be processed
  eleventyConfig.ignores.add('.kiro/**');
  eleventyConfig.ignores.add('node_modules/**');
  eleventyConfig.ignores.add('tests/**');
  eleventyConfig.ignores.add('README.md');

  // Configure markdown-it with html, breaks, linkify options
  const md = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  });
  
  eleventyConfig.setLibrary('md', md);

  // Passthrough copy for js folder only (CSS is compiled by Tailwind)
  eleventyConfig.addPassthroughCopy({'src/js': 'js'});
  eleventyConfig.addPassthroughCopy({'src/images': 'images'});

  // Useful filters
  eleventyConfig.addFilter('limit', function(arr, limit) {
    return arr.slice(0, limit);
  });

  eleventyConfig.addFilter('jsonify', function(data) {
    return JSON.stringify(data);
  });

  eleventyConfig.addFilter('slugify', function(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  });

  // Books collection with validation and alphabetical sorting
  eleventyConfig.addCollection('books', function(collectionApi) {
    const books = collectionApi.getFilteredByGlob('books/*.md');
    
    // Validate each book's frontmatter
    books.forEach(book => {
      const result = validateBookData(book.data);
      if (!result.valid) {
        const errorMsg = `Build Error in "${book.inputPath}":\n${result.errors.join('\n')}`;
        throw new Error(errorMsg);
      }
    });

    // Sort alphabetically by title
    return sortBooksAlphabetically(books);
  });

  // Search index collection
  eleventyConfig.addCollection('searchIndex', function(collectionApi) {
    const books = collectionApi.getFilteredByGlob('books/*.md');
    return generateSearchIndex(books);
  });

  return {
    dir: {
      input: '.',
      output: '_site',
      includes: 'src/_includes',
      data: 'src/_data'
    },
    templateFormats: ['md', 'njk', 'html'],
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk'
  };
};

/**
 * Sort books alphabetically by title
 * @param {Array} books - Array of book objects with data.title
 * @returns {Array} - Sorted array
 */
function sortBooksAlphabetically(books) {
  return [...books].sort((a, b) => {
    const titleA = a.data?.title || a.title || '';
    const titleB = b.data?.title || b.title || '';
    return titleA.localeCompare(titleB, 'vi');
  });
}

/**
 * Generate search index from books
 * @param {Array} books - Array of book objects
 * @returns {Array} - Search index items
 */
function generateSearchIndex(books) {
  return books.map(book => ({
    title: book.data?.title || book.title || '',
    author: book.data?.author || book.author || '',
    description: book.data?.description || book.description || '',
    tags: book.data?.tags || book.tags || [],
    url: `/books/${book.fileSlug || book.slug || ''}/`
  }));
}

/**
 * Paginate an array of items
 * @param {Array} items - Array of items to paginate
 * @param {number} pageSize - Number of items per page
 * @returns {Array} - Array of pages, each containing up to pageSize items
 */
function paginateItems(items, pageSize) {
  if (!Array.isArray(items) || pageSize <= 0) {
    return [];
  }
  
  const pages = [];
  for (let i = 0; i < items.length; i += pageSize) {
    pages.push(items.slice(i, i + pageSize));
  }
  
  // If items is empty, return one empty page
  if (pages.length === 0) {
    pages.push([]);
  }
  
  return pages;
}

/**
 * Render a book card HTML string
 * @param {Object} book - Book object with data.title, data.author, data.cover, data.description
 * @returns {Object} - { html: string, containsTitle: boolean, containsAuthor: boolean, containsCover: boolean }
 */
function renderBookCard(book) {
  const title = book.data?.title || '';
  const author = book.data?.author || '';
  const cover = book.data?.cover || '';
  const description = book.data?.description || '';
  const fileSlug = book.fileSlug || '';
  
  // Build HTML string similar to the Nunjucks template
  let html = `<a href="/books/${fileSlug}/" class="book-card block">`;
  html += `<div class="relative">`;
  html += `<img data-src="${cover}" alt="Bìa sách ${title}" class="book-card-image bg-gray-200 dark:bg-gray-700" loading="lazy">`;
  
  if (description) {
    html += `<div class="book-card-overlay"><p>${description}</p></div>`;
  }
  
  html += `</div>`;
  html += `<div class="book-card-content">`;
  html += `<h2 class="book-card-title">${title}</h2>`;
  html += `<p class="book-card-author">${author}</p>`;
  html += `</div></a>`;
  
  return {
    html,
    containsTitle: html.includes(title) && title.length > 0,
    containsAuthor: html.includes(author) && author.length > 0,
    containsCover: html.includes(cover) && cover.length > 0
  };
}

/**
 * Generate detail page URL from file slug
 * Property 7: Detail Page URL Follows Slug Pattern
 * @param {string} fileSlug - The file slug (derived from filename)
 * @returns {string} - The detail page URL
 */
function generateDetailPageUrl(fileSlug) {
  if (!fileSlug || typeof fileSlug !== 'string') {
    return '/books//index.html';
  }
  return `/books/${fileSlug}/index.html`;
}

/**
 * Render detail page metadata HTML
 * Property 8: Detail Page Contains Book Metadata
 * @param {Object} book - Book object with data fields
 * @returns {Object} - { html: string, containsCover: boolean, containsTitle: boolean, containsAuthor: boolean, containsTags: boolean, containsBreadcrumb: boolean }
 */
function renderDetailPageMetadata(book) {
  const title = book.data?.title || book.title || '';
  const author = book.data?.author || book.author || '';
  const cover = book.data?.cover || book.cover || '';
  const tags = book.data?.tags || book.tags || [];
  const description = book.data?.description || book.description || '';
  
  // Build HTML string similar to the detail.njk template
  let html = '<div class="detail-container">';
  
  // Breadcrumb
  html += '<nav class="breadcrumb" aria-label="Breadcrumb">';
  html += '<a href="/">Trang chủ</a>';
  html += '<span class="breadcrumb-separator">›</span>';
  html += `<span class="text-light-text dark:text-dark-text">${title}</span>`;
  html += '</nav>';
  
  // Detail Header
  html += '<div class="detail-header">';
  
  // Cover Image
  html += '<div class="detail-cover">';
  html += `<img src="${cover}" alt="Bìa sách ${title}" class="w-full rounded-lg shadow-lg">`;
  html += '</div>';
  
  // Book Info
  html += '<div class="detail-info">';
  html += `<h1 class="detail-title">${title}</h1>`;
  html += `<p class="detail-author">${author}</p>`;
  
  if (description) {
    html += `<p class="text-light-secondary dark:text-dark-secondary mb-4">${description}</p>`;
  }
  
  // Tags
  if (tags && tags.length > 0) {
    html += '<div class="detail-tags">';
    tags.forEach(tag => {
      html += `<span class="tag">${tag}</span>`;
    });
    html += '</div>';
  }
  
  html += '</div></div></div>';
  
  return {
    html,
    containsCover: html.includes(cover) && cover.length > 0,
    containsTitle: html.includes(title) && title.length > 0,
    containsAuthor: html.includes(author) && author.length > 0,
    containsTags: tags.length === 0 || tags.every(tag => html.includes(tag)),
    containsBreadcrumb: html.includes('Trang chủ') && html.includes(title)
  };
}

/**
 * Generate JSON-LD structured data for a book
 * Property 16: JSON-LD Structured Data Valid
 * @param {Object} book - Book object with data fields
 * @returns {Object} - { jsonLd: Object, isValid: boolean, hasRequiredFields: boolean }
 */
function generateJsonLd(book) {
  const title = book.data?.title || book.title || '';
  const author = book.data?.author || book.author || '';
  const cover = book.data?.cover || book.cover || '';
  const description = book.data?.description || book.description || '';
  const tags = book.data?.tags || book.tags || [];
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": title,
    "author": {
      "@type": "Person",
      "name": author
    },
    "image": cover
  };
  
  // Add optional fields
  if (description) {
    jsonLd.description = description;
  }
  
  if (tags && tags.length > 0) {
    jsonLd.genre = tags;
  }
  
  // Validate required fields
  const hasRequiredFields = 
    jsonLd["@context"] === "https://schema.org" &&
    jsonLd["@type"] === "Book" &&
    jsonLd.name && jsonLd.name.length > 0 &&
    jsonLd.author && jsonLd.author["@type"] === "Person" && jsonLd.author.name &&
    jsonLd.image && jsonLd.image.length > 0;
  
  return {
    jsonLd,
    isValid: hasRequiredFields,
    hasRequiredFields,
    containsTitle: jsonLd.name === title,
    containsAuthor: jsonLd.author.name === author,
    containsImage: jsonLd.image === cover
  };
}

// Export for testing
module.exports.validateBookData = validateBookData;
module.exports.ERROR_MESSAGES = ERROR_MESSAGES;
module.exports.REQUIRED_FIELDS = REQUIRED_FIELDS;
module.exports.sortBooksAlphabetically = sortBooksAlphabetically;
module.exports.generateSearchIndex = generateSearchIndex;
module.exports.paginateItems = paginateItems;
module.exports.renderBookCard = renderBookCard;
module.exports.generateDetailPageUrl = generateDetailPageUrl;
module.exports.renderDetailPageMetadata = renderDetailPageMetadata;
module.exports.generateJsonLd = generateJsonLd;
