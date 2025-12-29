# Requirements Document

## Introduction

SSGEpub là một Static Site Generator được xây dựng bằng Eleventy (11ty) để tạo website hiển thị danh sách sách/truyện từ các file Markdown, với khả năng tìm kiếm fuzzy, dark mode, và tự động deploy lên GitHub Pages thông qua GitHub Actions.

## Glossary

- **SSG (Static Site Generator)**: Công cụ tạo website tĩnh từ các file nguồn
- **Eleventy (11ty)**: Framework SSG dựa trên Node.js
- **Book_Card**: Component hiển thị thông tin sách dạng card trên trang chủ
- **Detail_Page**: Trang hiển thị chi tiết một cuốn sách
- **Search_Engine**: Module tìm kiếm sử dụng Fuse.js
- **Theme_Manager**: Module quản lý dark/light mode
- **Download_Manager**: Module xử lý logic tải xuống qua Cloudflare API
- **Build_System**: Hệ thống build Eleventy và GitHub Actions
- **Markdown_Parser**: Module parse và validate file markdown
- **Search_Index**: File JSON chứa dữ liệu tìm kiếm được generate lúc build

## Requirements

### Requirement 1: Markdown Content Management

**User Story:** As a content manager, I want to add books/stories using Markdown files with frontmatter metadata, so that I can easily manage content without a database.

#### Acceptance Criteria

1. WHEN a markdown file is placed in `/books/` directory, THE Build_System SHALL parse it and include in the site build
2. THE Markdown_Parser SHALL require these fields in frontmatter: `title`, `author`, `cover`, `downloadLinks`
3. IF a markdown file is missing required fields, THEN THE Build_System SHALL fail the build with descriptive error message
4. WHEN `downloadLinks` array has fewer than 1 item, THE Build_System SHALL fail the build
5. THE Markdown_Parser SHALL support optional fields: `description`, `tags`, `publishDate`
6. WHEN markdown content contains formatting (bold, italic, lists, headers), THE Markdown_Parser SHALL render them as HTML

### Requirement 2: Homepage Display

**User Story:** As a visitor, I want to browse all available books on the homepage in a grid layout, so that I can discover content easily.

#### Acceptance Criteria

1. THE Homepage SHALL display Book_Card components in a responsive grid layout
2. WHEN viewport width is less than 640px, THE Homepage SHALL display 1 column
3. WHEN viewport width is between 640px and 1024px, THE Homepage SHALL display 2 columns
4. WHEN viewport width is greater than 1024px, THE Homepage SHALL display 3-4 columns
5. THE Homepage SHALL sort books alphabetically by title (A-Z)
6. THE Homepage SHALL implement pagination with 12-20 items per page
7. WHEN a Book_Card is rendered, THE Book_Card SHALL display cover image, title, and author
8. WHEN user hovers over a Book_Card, THE Book_Card SHALL display description overlay
9. WHEN user clicks a Book_Card, THE Homepage SHALL navigate to the book's Detail_Page
10. THE Homepage SHALL lazy load cover images using Intersection Observer

### Requirement 3: Book Detail Page

**User Story:** As a visitor, I want to view detailed information about a book and download it, so that I can access the content I'm interested in.

#### Acceptance Criteria

1. THE Detail_Page SHALL be accessible at URL `/books/[slug].html`
2. THE Detail_Page SHALL display breadcrumb navigation: "Trang chủ > Tên Truyện"
3. THE Detail_Page SHALL display cover image, title, author, and tags
4. THE Detail_Page SHALL render markdown content as formatted HTML
5. THE Detail_Page SHALL display a "Tải xuống" (Download) button
6. WHEN Detail_Page loads, THE Download_Manager SHALL call Cloudflare API to get platform index
7. WHILE Cloudflare API is loading, THE Download_Manager SHALL disable the download button
8. WHEN Cloudflare API returns successfully, THE Download_Manager SHALL store index in sessionStorage
9. IF Cloudflare API fails, THEN THE Download_Manager SHALL use `downloadLinks[0]` as fallback
10. WHEN user clicks download button, THE Download_Manager SHALL open selected link in new tab
11. THE Detail_Page SHALL include a back button to return to homepage

### Requirement 4: Search Functionality

**User Story:** As a visitor, I want to search for books by title, author, or tags, so that I can quickly find specific content.

#### Acceptance Criteria

1. THE Build_System SHALL generate `search-index.json` containing title, author, description, tags, and URL for each book
2. THE Search_Engine SHALL use Fuse.js for fuzzy search
3. WHEN on desktop viewport, THE Header SHALL display a visible search input
4. WHEN on mobile viewport, THE Header SHALL display a search icon that reveals search input on click
5. WHEN user types in search input, THE Search_Engine SHALL display real-time results (max 5 items)
6. WHEN user presses Enter in search input, THE Search_Engine SHALL navigate to `/search.html?q=keyword`
7. THE Search_Page SHALL display search results matching the query
8. WHEN user clicks a search result, THE Search_Page SHALL navigate to that book's Detail_Page

### Requirement 5: Dark Mode

**User Story:** As a visitor, I want to toggle between light and dark themes, so that I can read comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Theme_Manager SHALL support two modes: light and dark
2. THE Header SHALL display a theme toggle button (🌙 for dark, ☀️ for light)
3. WHEN user clicks theme toggle, THE Theme_Manager SHALL switch between light and dark mode
4. WHEN theme changes, THE Theme_Manager SHALL save preference to localStorage
5. WHEN page loads, THE Theme_Manager SHALL apply saved theme from localStorage
6. IF no saved theme exists, THEN THE Theme_Manager SHALL use system preference or default to light mode

### Requirement 6: 404 Error Page

**User Story:** As a visitor, I want to see a helpful error page when I navigate to a non-existent URL, so that I can find my way back to valid content.

#### Acceptance Criteria

1. THE 404_Page SHALL display message "404 - Không tìm thấy"
2. THE 404_Page SHALL display explanation "Trang bạn tìm kiếm không tồn tại."
3. THE 404_Page SHALL display a button linking to homepage

### Requirement 7: SEO Optimization

**User Story:** As a site owner, I want the site to be SEO-optimized, so that search engines can properly index and rank my content.

#### Acceptance Criteria

1. THE Build_System SHALL generate appropriate meta tags (title, description, og:title, og:description, og:image, twitter:card)
2. THE Build_System SHALL generate `sitemap.xml` at build time
3. THE Build_System SHALL generate `robots.txt` at build time
4. THE Detail_Page SHALL include JSON-LD structured data for Book schema
5. WHEN a page is rendered, THE page SHALL include canonical URL meta tag

### Requirement 8: Responsive Design

**User Story:** As a visitor, I want the site to work well on all devices, so that I can access content from mobile, tablet, or desktop.

#### Acceptance Criteria

1. THE Site SHALL be fully functional on mobile devices (< 640px)
2. THE Site SHALL be fully functional on tablet devices (640px - 1024px)
3. THE Site SHALL be fully functional on desktop devices (> 1024px)
4. THE Site SHALL have touch-friendly buttons with minimum 44px height
5. THE Detail_Page SHALL use stacked layout on mobile devices

### Requirement 9: Build and Deployment

**User Story:** As a developer, I want automated build and deployment, so that content updates are published automatically.

#### Acceptance Criteria

1. WHEN code is pushed to `master` branch, THE GitHub_Actions SHALL trigger build workflow
2. THE Build_System SHALL use Eleventy to generate static HTML files
3. THE Build_System SHALL compile Tailwind CSS with production optimizations
4. THE Build_System SHALL output files to `_site/` directory
5. WHEN build succeeds, THE GitHub_Actions SHALL deploy to `gh-pages` branch
6. THE Build_System SHALL support local development with `npm run serve`

### Requirement 10: Performance Optimization

**User Story:** As a visitor, I want the site to load quickly, so that I can access content without waiting.

#### Acceptance Criteria

1. THE Site SHALL lazy load images using Intersection Observer
2. THE Site SHALL preconnect to Google Fonts
3. THE Site SHALL use `font-display: swap` for web fonts
4. THE Build_System SHALL purge unused CSS in production build
