# Design Document: SSGEpub

## Overview

SSGEpub là một Static Site Generator xây dựng trên Eleventy (11ty) để tạo website hiển thị sách/truyện từ Markdown files. Hệ thống sử dụng Tailwind CSS cho styling, Fuse.js cho tìm kiếm fuzzy, và GitHub Actions cho CI/CD tự động.

### Tech Stack
- **Eleventy (11ty) v2.x** - Static Site Generator
- **Tailwind CSS v3.x** - Utility-first CSS framework
- **Nunjucks** - Template engine
- **Fuse.js v7.x** - Fuzzy search library
- **Vanilla JavaScript** - Client-side logic
- **GitHub Actions** - CI/CD automation

### Build Flow
```
Markdown files (books/*.md)
        ↓
   Eleventy Build
        ↓
   ┌────────────────┐
   │ Static HTML    │
   │ CSS (Tailwind) │
   │ JavaScript     │
   │ search-index.json │
   └────────────────┘
        ↓
   GitHub Pages (gh-pages branch)
```

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        SSGEpub                               │
├─────────────────────────────────────────────────────────────┤
│  Build Time (Eleventy)           │  Runtime (Browser)       │
│  ─────────────────────           │  ─────────────────       │
│  • Markdown Parser               │  • Theme Manager         │
│  • Template Engine (Nunjucks)    │  • Search Engine         │
│  • Collection Builder            │  • Download Manager      │
│  • Search Index Generator        │  • Lazy Load Observer    │
│  • CSS Compiler (Tailwind)       │                          │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
SSGEpub/
├── books/                      # Markdown content files
│   ├── book-1.md
│   └── book-2.md
├── src/
│   ├── _includes/              # Nunjucks layouts & partials
│   │   ├── base.njk           # Base HTML layout
│   │   ├── home.njk           # Homepage layout
│   │   ├── detail.njk         # Book detail layout
│   │   ├── search.njk         # Search page layout
│   │   └── 404.njk            # 404 page layout
│   ├── _data/                  # Global data files
│   │   └── site.json          # Site configuration
│   ├── css/
│   │   └── styles.css         # Tailwind CSS source
│   ├── js/
│   │   ├── theme.js           # Dark mode logic
│   │   ├── search.js          # Search functionality
│   │   ├── download.js        # Cloudflare API integration
│   │   └── lazyload.js        # Image lazy loading
│   ├── index.njk              # Homepage template
│   ├── search.njk             # Search page template
│   ├── 404.njk                # 404 page template
│   └── search-index.njk       # Search index JSON generator
├── .eleventy.js               # Eleventy configuration
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
├── package.json
├── .github/
│   └── workflows/
│       └── build.yml          # GitHub Actions workflow
└── README.md
```

## Components and Interfaces

### 1. Eleventy Configuration (.eleventy.js)

```javascript
// Interface: EleventyConfig
module.exports = function(eleventyConfig) {
  // Collections
  addCollection("books", collectionApi): BookCollection
  addCollection("searchIndex", collectionApi): SearchIndexItem[]
  
  // Filters
  addFilter("limit", (arr, limit)): Array
  addFilter("jsonify", (data)): string
  addFilter("slugify", (str)): string
  
  // Passthrough Copy
  addPassthroughCopy("src/js")
  addPassthroughCopy("src/css")
  
  // Markdown Library Configuration
  setLibrary("md", markdownItInstance)
  
  return {
    dir: { input, output, includes, data },
    templateFormats: ["md", "njk", "html"]
  }
}
```

### 2. Theme Manager (theme.js)

```javascript
// Interface: ThemeManager
class ThemeManager {
  STORAGE_KEY: string = 'ssgepub_theme'
  
  // Initialize theme on page load
  init(): void
  
  // Get current theme ('light' | 'dark')
  getTheme(): string
  
  // Set theme and persist to localStorage
  setTheme(theme: string): void
  
  // Toggle between light and dark
  toggle(): void
  
  // Apply theme class to document
  applyTheme(theme: string): void
}
```

### 3. Search Engine (search.js)

```javascript
// Interface: SearchEngine
class SearchEngine {
  fuse: Fuse
  searchIndex: SearchIndexItem[]
  
  // Initialize Fuse.js with search index
  init(): Promise<void>
  
  // Perform search and return results
  search(query: string): SearchResult[]
  
  // Render search results dropdown
  renderResults(results: SearchResult[]): void
  
  // Handle search form submission
  handleSubmit(event: Event): void
}

// Interface: SearchIndexItem
interface SearchIndexItem {
  title: string
  author: string
  description: string
  tags: string[]
  url: string
}

// Interface: SearchResult
interface SearchResult {
  item: SearchIndexItem
  score: number
}
```

### 4. Download Manager (download.js)

```javascript
// Interface: DownloadManager
class DownloadManager {
  API_URL: string = 'https://your-worker.workers.dev/api/get-link-platform'
  STORAGE_KEY: string = 'ssgepub_platform_index'
  downloadLinks: DownloadLink[]
  
  // Initialize with download links from page data
  init(links: DownloadLink[]): void
  
  // Get platform index from API or cache
  getPlatformIndex(): Promise<number>
  
  // Get selected download link
  getDownloadLink(): Promise<DownloadLink>
  
  // Handle download button click
  handleDownload(): void
  
  // Set button loading state
  setLoading(isLoading: boolean): void
}

// Interface: DownloadLink
interface DownloadLink {
  url: string
  platform: string
}
```

### 5. Lazy Load Observer (lazyload.js)

```javascript
// Interface: LazyLoadObserver
class LazyLoadObserver {
  observer: IntersectionObserver
  
  // Initialize observer
  init(): void
  
  // Observe all images with data-src attribute
  observeImages(): void
  
  // Load image when intersecting
  loadImage(img: HTMLImageElement): void
}
```

### 6. Markdown Validator

```javascript
// Interface: MarkdownValidator (Build-time)
// Implemented in .eleventy.js

// Required fields validation
const REQUIRED_FIELDS = ['title', 'author', 'cover', 'downloadLinks']

function validateBookData(data: BookFrontmatter): ValidationResult {
  // Check required fields exist
  // Check downloadLinks has at least 1 item
  // Return validation result with errors
}

// Interface: ValidationResult
interface ValidationResult {
  valid: boolean
  errors: string[]
}
```

## Data Models

### 1. Book Frontmatter Schema

```typescript
interface BookFrontmatter {
  // Required fields
  title: string           // Book title
  author: string          // Author name
  cover: string           // Cover image URL
  downloadLinks: DownloadLink[]  // At least 1 item required
  
  // Optional fields
  description?: string    // Short description
  tags?: string[]         // Category tags
  publishDate?: Date      // Publication date
}

interface DownloadLink {
  url: string             // Download URL
  platform: string        // Platform name (e.g., "YeuMoney", "Site2s")
}
```

### 2. Site Configuration (src/_data/site.json)

```json
{
  "name": "SSGEpub",
  "description": "Static Site Generator cho Sách/Truyện",
  "url": "https://username.github.io/SSGEpub",
  "language": "vi",
  "pagination": {
    "size": 12
  },
  "cloudflareApiUrl": "https://your-worker.workers.dev/api/get-link-platform"
}
```

### 3. Search Index Item

```typescript
interface SearchIndexItem {
  title: string
  author: string
  description: string
  tags: string[]
  url: string
}
```

### 4. Theme State

```typescript
type Theme = 'light' | 'dark'

interface ThemeState {
  current: Theme
  storageKey: 'ssgepub_theme'
}
```

## Error Handling

### Build-Time Errors

| Error Type | Condition | Handling |
|------------|-----------|----------|
| Missing Required Field | Frontmatter lacks title, author, cover, or downloadLinks | Build fails with descriptive error message |
| Empty Download Links | downloadLinks array is empty | Build fails with error |
| Invalid Markdown | Malformed frontmatter YAML | Build fails with parse error |

### Runtime Errors

| Error Type | Condition | Handling |
|------------|-----------|----------|
| API Failure | Cloudflare API unreachable or returns error | Use downloadLinks[0] as fallback |
| Search Index Load Failure | search-index.json fails to load | Display error message, disable search |
| Image Load Failure | Cover image URL broken | Display placeholder image |

### Error Messages (Vietnamese)

```javascript
const ERROR_MESSAGES = {
  MISSING_TITLE: 'Thiếu trường "title" trong frontmatter',
  MISSING_AUTHOR: 'Thiếu trường "author" trong frontmatter',
  MISSING_COVER: 'Thiếu trường "cover" trong frontmatter',
  MISSING_DOWNLOAD_LINKS: 'Thiếu trường "downloadLinks" trong frontmatter',
  EMPTY_DOWNLOAD_LINKS: 'downloadLinks phải có ít nhất 1 item',
  API_FAILED: 'Không thể kết nối API, sử dụng link mặc định',
  SEARCH_FAILED: 'Không thể tải dữ liệu tìm kiếm'
}
```

## Testing Strategy

### Unit Tests

Unit tests sẽ được viết cho các module JavaScript client-side:

1. **ThemeManager Tests**
   - Test init() applies correct theme from localStorage
   - Test toggle() switches between themes
   - Test setTheme() persists to localStorage

2. **SearchEngine Tests**
   - Test search() returns correct results
   - Test empty query returns empty results
   - Test fuzzy matching works correctly

3. **DownloadManager Tests**
   - Test getPlatformIndex() returns cached value
   - Test API failure fallback to index 0
   - Test getDownloadLink() returns correct link

4. **Validation Tests**
   - Test required field validation
   - Test downloadLinks array validation

### Property-Based Tests

Property-based tests sẽ validate các correctness properties được định nghĩa bên dưới.

### Integration Tests

1. **Build Process**
   - Test Eleventy builds successfully with valid markdown
   - Test build fails with invalid markdown

2. **Search Flow**
   - Test search index generation
   - Test search results navigation

### Test Framework

- **Jest** - Unit testing framework
- **fast-check** - Property-based testing library
- **Testing Library** - DOM testing utilities



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the acceptance criteria analysis, the following correctness properties have been identified for property-based testing:

### Property 1: Frontmatter Validation Rejects Invalid Data

*For any* frontmatter object missing one or more required fields (title, author, cover, downloadLinks), the validation function SHALL return an invalid result with descriptive error messages listing the missing fields.

**Validates: Requirements 1.2, 1.3**

### Property 2: Valid Frontmatter Passes Validation

*For any* frontmatter object containing all required fields (title, author, cover, downloadLinks with at least 1 item), the validation function SHALL return a valid result regardless of whether optional fields are present.

**Validates: Requirements 1.2, 1.5**

### Property 3: Markdown Rendering Preserves Content

*For any* markdown string containing formatting (bold, italic, lists, headers), rendering to HTML SHALL produce output containing the text content and appropriate HTML tags for each formatting element.

**Validates: Requirements 1.6, 3.4**

### Property 4: Books Collection Sorted Alphabetically

*For any* collection of books with random titles, the sorted collection SHALL have each book's title lexicographically less than or equal to the next book's title.

**Validates: Requirements 2.5**

### Property 5: Pagination Respects Size Limit

*For any* collection of N books and pagination size S, each page SHALL contain at most S items, and the total items across all pages SHALL equal N.

**Validates: Requirements 2.6**

### Property 6: Book Card Contains Required Information

*For any* book data with title, author, and cover, the rendered Book_Card HTML SHALL contain all three pieces of information.

**Validates: Requirements 2.7**

### Property 7: Detail Page URL Follows Slug Pattern

*For any* book with a title, the generated detail page URL SHALL be `/books/[slugified-title].html` where the slug is derived from the title.

**Validates: Requirements 3.1**

### Property 8: Detail Page Contains Book Metadata

*For any* book data, the rendered detail page HTML SHALL contain the cover image, title, author, tags (if present), and breadcrumb with the book title.

**Validates: Requirements 3.2, 3.3**

### Property 9: Download Manager Fallback on API Failure

*For any* downloadLinks array with at least one item, when the API call fails, the Download_Manager SHALL return downloadLinks[0].

**Validates: Requirements 3.9**

### Property 10: Search Index Contains All Book Fields

*For any* book in the collection, the generated search index entry SHALL contain title, author, description, tags, and url fields matching the book data.

**Validates: Requirements 4.1**

### Property 11: Search Results Limited to Maximum

*For any* search query against any search index, the returned results SHALL contain at most 5 items.

**Validates: Requirements 4.5**

### Property 12: Search Results Are Relevant

*For any* search query, all returned results SHALL have a relevance score indicating the query matches at least one of: title, author, description, or tags.

**Validates: Requirements 4.7**

### Property 13: Theme Toggle Round-Trip

*For any* initial theme state, toggling the theme twice SHALL return to the original theme state.

**Validates: Requirements 5.3**

### Property 14: Theme Persistence Round-Trip

*For any* theme value ('light' or 'dark'), setting the theme and then retrieving it from localStorage SHALL return the same value.

**Validates: Requirements 5.4, 5.5**

### Property 15: SEO Meta Tags Present

*For any* book data, the rendered page HTML SHALL contain meta tags for title, description, og:title, og:description, og:image, and canonical URL.

**Validates: Requirements 7.1, 7.5**

### Property 16: JSON-LD Structured Data Valid

*For any* book data, the rendered detail page SHALL contain valid JSON-LD with @type "Book" and properties matching the book's title, author, and cover.

**Validates: Requirements 7.4**
