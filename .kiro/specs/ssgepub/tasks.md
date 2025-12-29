# Implementation Plan: SSGEpub

## Overview

Triển khai SSGEpub - Static Site Generator cho sách/truyện sử dụng Eleventy, Tailwind CSS, Fuse.js và GitHub Actions. Implementation sẽ được thực hiện theo thứ tự: project setup → core build system → templates → client-side features → CI/CD.

## Tasks

- [x] 1. Project Setup and Configuration
  - [x] 1.1 Initialize npm project and install dependencies
    - Create package.json with scripts: build, serve, debug
    - Install: @11ty/eleventy, markdown-it, tailwindcss, postcss, autoprefixer, fuse.js
    - Install dev dependencies: jest, fast-check, @testing-library/dom
    - _Requirements: 9.2, 9.6_

  - [x] 1.2 Create Eleventy configuration file
    - Configure input/output directories
    - Set up markdown-it with html, breaks, linkify options
    - Add passthrough copy for js and css folders
    - _Requirements: 9.2, 9.3_

  - [x] 1.3 Create Tailwind CSS configuration
    - Configure darkMode: 'class'
    - Set up content paths for template files
    - Define color palette for light/dark modes
    - Create postcss.config.js
    - _Requirements: 9.3_

  - [x] 1.4 Create site data configuration
    - Create src/_data/site.json with site name, description, pagination size
    - _Requirements: 2.6_

- [x] 2. Markdown Validation and Collections
  - [x] 2.1 Implement frontmatter validation in Eleventy config
    - Create validateBookData function checking required fields
    - Throw build error with descriptive message on validation failure
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 2.2 Write property tests for frontmatter validation
    - **Property 1: Frontmatter Validation Rejects Invalid Data**
    - **Property 2: Valid Frontmatter Passes Validation**
    - **Validates: Requirements 1.2, 1.3, 1.5**

  - [x] 2.3 Create books collection with alphabetical sorting
    - Add "books" collection from books/*.md glob
    - Sort by title using localeCompare
    - _Requirements: 2.5_

  - [x] 2.4 Write property test for alphabetical sorting
    - **Property 4: Books Collection Sorted Alphabetically**
    - **Validates: Requirements 2.5**

  - [x] 2.5 Create search index collection and template
    - Add "searchIndex" collection mapping book data
    - Create src/search-index.njk generating JSON
    - _Requirements: 4.1_

  - [x] 2.6 Write property test for search index generation
    - **Property 10: Search Index Contains All Book Fields**
    - **Validates: Requirements 4.1**

- [x] 3. Base Layout and Components
  - [x] 3.1 Create base layout template (base.njk)
    - HTML5 structure with lang="vi"
    - Include SEO meta tags (title, description, og:*, twitter:card, canonical)
    - Preconnect to Google Fonts, load Inter font
    - Include CSS and JS files
    - _Requirements: 7.1, 7.5, 10.2, 10.3_

  - [x] 3.2 Write property test for SEO meta tags
    - **Property 15: SEO Meta Tags Present**
    - **Validates: Requirements 7.1, 7.5**

  - [x] 3.3 Create header component with navigation
    - Logo/site name linking to homepage
    - Search input (desktop) / search icon (mobile)
    - Theme toggle button
    - _Requirements: 4.3, 4.4, 5.2_

  - [x] 3.4 Create Tailwind CSS styles
    - Define light/dark mode color variables
    - Style header, cards, buttons, grid layouts
    - Add responsive breakpoints
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 4. Homepage Implementation
  - [x] 4.1 Create homepage template (home.njk / index.njk)
    - Extend base layout
    - Implement responsive grid (1/2/3-4 columns)
    - Add pagination with configured size
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

  - [x] 4.2 Write property test for pagination
    - **Property 5: Pagination Respects Size Limit**
    - **Validates: Requirements 2.6**

  - [x] 4.3 Create Book Card component
    - Display cover image with data-src for lazy loading
    - Show title and author
    - Add hover overlay for description
    - Link to detail page
    - _Requirements: 2.7, 2.8, 2.9_

  - [x] 4.4 Write property test for Book Card rendering
    - **Property 6: Book Card Contains Required Information**
    - **Validates: Requirements 2.7**

- [x] 5. Detail Page Implementation
  - [x] 5.1 Create detail page template (detail.njk)
    - Configure permalink to /books/{{ page.fileSlug }}.html
    - Display breadcrumb navigation
    - Show cover, title, author, tags
    - Render markdown content
    - Add back button and download button
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.11_

  - [x] 5.2 Write property tests for detail page
    - **Property 7: Detail Page URL Follows Slug Pattern**
    - **Property 8: Detail Page Contains Book Metadata**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [x] 5.3 Add JSON-LD structured data for books
    - Include @context, @type: "Book", name, author, image
    - _Requirements: 7.4_

  - [x] 5.4 Write property test for JSON-LD
    - **Property 16: JSON-LD Structured Data Valid**
    - **Validates: Requirements 7.4**

- [x] 6. Checkpoint - Core Build System
  - Ensure Eleventy builds successfully with sample markdown files
  - Verify all templates render correctly
  - Run all property tests
  - Ask the user if questions arise

- [x] 7. Client-Side JavaScript - Theme Manager
  - [x] 7.1 Implement ThemeManager class (theme.js)
    - init() - apply theme from localStorage or system preference
    - getTheme() - return current theme
    - setTheme(theme) - apply and persist theme
    - toggle() - switch between light/dark
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6_

  - [x] 7.2 Write property tests for ThemeManager
    - **Property 13: Theme Toggle Round-Trip**
    - **Property 14: Theme Persistence Round-Trip**
    - **Validates: Requirements 5.3, 5.4, 5.5**

- [x] 8. Client-Side JavaScript - Search Engine
  - [x] 8.1 Implement SearchEngine class (search.js)
    - init() - load search-index.json and initialize Fuse.js
    - search(query) - perform fuzzy search, limit to 5 results
    - renderResults(results) - display dropdown
    - handleSubmit(event) - navigate to search page
    - _Requirements: 4.2, 4.5, 4.6, 4.7_

  - [x] 8.2 Write property tests for SearchEngine
    - **Property 11: Search Results Limited to Maximum**
    - **Property 12: Search Results Are Relevant**
    - **Validates: Requirements 4.5, 4.7**

  - [x] 8.3 Create search page template (search.njk)
    - Display search input
    - Show results based on query parameter
    - _Requirements: 4.7, 4.8_

- [x] 9. Client-Side JavaScript - Download Manager
  - [x] 9.1 Implement DownloadManager class (download.js)
    - init(links) - store download links
    - getPlatformIndex() - fetch from API or sessionStorage cache
    - getDownloadLink() - return selected link
    - handleDownload() - open link in new tab
    - setLoading(isLoading) - toggle button state
    - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.10_

  - [x] 9.2 Write property test for Download Manager fallback
    - **Property 9: Download Manager Fallback on API Failure**
    - **Validates: Requirements 3.9**

- [x] 10. Client-Side JavaScript - Lazy Load
  - [x] 10.1 Implement LazyLoadObserver (lazyload.js)
    - Create IntersectionObserver
    - Observe images with data-src attribute
    - Load image when intersecting
    - _Requirements: 2.10, 10.1_

- [x] 11. Additional Pages and SEO
  - [x] 11.1 Create 404 page template (404.njk)
    - Display "404 - Không tìm thấy" message
    - Add explanation text
    - Include link to homepage
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 11.2 Generate sitemap.xml
    - Create sitemap template or use Eleventy plugin
    - Include all book pages and main pages
    - _Requirements: 7.2_

  - [x] 11.3 Create robots.txt
    - Allow all crawlers
    - Reference sitemap.xml
    - _Requirements: 7.3_

- [x] 12. GitHub Actions Workflow
  - [x] 12.1 Create build and deploy workflow
    - Trigger on push to master branch
    - Setup Node.js 20.x with npm cache
    - Run npm ci and npm run build
    - Deploy _site to gh-pages branch
    - _Requirements: 9.1, 9.4, 9.5_

- [x] 13. Sample Content and Documentation
  - [x] 13.1 Create sample book markdown files
    - Create 2-3 sample books in /books/ directory
    - Include all required and optional fields
    - _Requirements: 1.1_

  - [x] 13.2 Create README.md documentation
    - Write installation and usage guide in Vietnamese
    - Include customization instructions
    - Document troubleshooting tips
    - _Requirements: Documentation_

- [x] 14. Final Checkpoint
  - Run full build and verify output
  - Test all pages in browser
  - Run all unit and property tests
  - Verify GitHub Actions workflow syntax
  - Ask the user if questions arise

## Notes

- All tasks including property-based tests are required for comprehensive coverage
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use fast-check library for JavaScript
- Unit tests use Jest framework
