# SSGEpub

Static Site Generator cho Sách/Truyện - Xây dựng website hiển thị sách/truyện từ file Markdown với tìm kiếm fuzzy, dark mode, và tự động deploy lên GitHub Pages.

## Tính năng

- 📚 **Quản lý nội dung bằng Markdown** - Thêm sách/truyện dễ dàng với file Markdown
- 🔍 **Tìm kiếm Fuzzy** - Tìm kiếm nhanh theo tiêu đề, tác giả, tags với Fuse.js
- 🌙 **Dark Mode** - Chuyển đổi giao diện sáng/tối, lưu preference
- 📱 **Responsive Design** - Hiển thị tốt trên mọi thiết bị
- ⚡ **Lazy Loading** - Tải ảnh khi cần thiết để tối ưu hiệu suất
- 🚀 **Auto Deploy** - Tự động build và deploy với GitHub Actions
- 🔗 **SEO Friendly** - Meta tags, sitemap, robots.txt, JSON-LD

## Cài đặt

### Yêu cầu

- Node.js 18.x hoặc cao hơn
- npm hoặc yarn

### Bước 1: Clone repository

```bash
git clone https://github.com/username/SSGEpub.git
cd SSGEpub
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Chạy development server

```bash
npm run serve
```

Truy cập `http://localhost:8080` để xem website.

## Sử dụng

### Thêm sách mới

Tạo file Markdown trong thư mục `/books/` với cấu trúc sau:

```markdown
---
title: "Tên Sách"
author: "Tên Tác Giả"
cover: "https://link-anh-bia.jpg"
description: "Mô tả ngắn về cuốn sách"
tags:
  - "Thể loại 1"
  - "Thể loại 2"
publishDate: 2024-01-01
downloadLinks:
  - url: "https://link-tai-1.com"
    platform: "YeuMoney"
  - url: "https://link-tai-2.com"
    platform: "Site2s"
---

# Nội dung sách

Viết nội dung chi tiết ở đây...
```

### Các trường bắt buộc

| Trường | Mô tả |
|--------|-------|
| `title` | Tiêu đề sách |
| `author` | Tên tác giả |
| `cover` | URL ảnh bìa |
| `downloadLinks` | Mảng chứa ít nhất 1 link tải |

### Các trường tùy chọn

| Trường | Mô tả |
|--------|-------|
| `description` | Mô tả ngắn (hiển thị khi hover) |
| `tags` | Mảng các thể loại/tags |
| `publishDate` | Ngày xuất bản |

## Cấu hình

### Cấu hình site (`src/_data/site.json`)

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

| Thuộc tính | Mô tả |
|------------|-------|
| `name` | Tên website |
| `description` | Mô tả website |
| `url` | URL của website |
| `language` | Ngôn ngữ (vi, en, ...) |
| `pagination.size` | Số sách mỗi trang |
| `cloudflareApiUrl` | URL API Cloudflare Worker (tùy chọn) |

### Cấu hình Tailwind (`tailwind.config.js`)

Tùy chỉnh màu sắc, font chữ trong file `tailwind.config.js`.

## Scripts

| Lệnh | Mô tả |
|------|-------|
| `npm run build` | Build website production |
| `npm run serve` | Chạy development server |
| `npm run debug` | Build với debug logs |
| `npm test` | Chạy unit tests |

## Cấu trúc thư mục

```
SSGEpub/
├── books/                  # File Markdown sách/truyện
├── src/
│   ├── _includes/          # Templates Nunjucks
│   ├── _data/              # Dữ liệu site
│   ├── css/                # Tailwind CSS
│   ├── js/                 # JavaScript client-side
│   ├── index.njk           # Trang chủ
│   ├── search.njk          # Trang tìm kiếm
│   └── 404.njk             # Trang 404
├── tests/                  # Unit tests
├── .eleventy.js            # Cấu hình Eleventy
├── tailwind.config.js      # Cấu hình Tailwind
└── package.json
```

## Deploy lên GitHub Pages

### Tự động với GitHub Actions

1. Push code lên branch `master`
2. GitHub Actions sẽ tự động build và deploy lên branch `gh-pages`
3. Vào Settings > Pages, chọn source là branch `gh-pages`

### Thủ công

```bash
npm run build
# Upload thư mục _site/ lên hosting
```

## Tùy chỉnh

### Thay đổi giao diện

1. **Màu sắc**: Chỉnh sửa `tailwind.config.js`
2. **Layout**: Chỉnh sửa templates trong `src/_includes/`
3. **CSS**: Thêm styles vào `src/css/styles.css`

### Thay đổi số sách mỗi trang

Chỉnh `pagination.size` trong `src/_data/site.json`

### Tích hợp Cloudflare Worker

Để sử dụng tính năng chọn link tải theo platform:

1. Tạo Cloudflare Worker với endpoint `/api/get-link-platform`
2. Cập nhật `cloudflareApiUrl` trong `src/_data/site.json`

## Xử lý sự cố

### Build thất bại với lỗi "Missing required field"

**Nguyên nhân**: File Markdown thiếu trường bắt buộc.

**Giải pháp**: Kiểm tra frontmatter có đủ các trường: `title`, `author`, `cover`, `downloadLinks`.

### Ảnh bìa không hiển thị

**Nguyên nhân**: URL ảnh không hợp lệ hoặc bị chặn CORS.

**Giải pháp**: 
- Kiểm tra URL ảnh có thể truy cập được
- Sử dụng ảnh từ CDN hỗ trợ CORS
- Upload ảnh lên repository và dùng đường dẫn tương đối

### Tìm kiếm không hoạt động

**Nguyên nhân**: File `search-index.json` chưa được generate.

**Giải pháp**: Chạy `npm run build` để generate lại search index.

### Dark mode không lưu

**Nguyên nhân**: localStorage bị chặn hoặc đầy.

**Giải pháp**: Kiểm tra browser settings cho phép localStorage.

### GitHub Actions thất bại

**Nguyên nhân**: Thiếu quyền hoặc cấu hình sai.

**Giải pháp**:
1. Vào Settings > Actions > General
2. Chọn "Read and write permissions" cho Workflow permissions
3. Kiểm tra file `.github/workflows/build.yml`

## Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/TinhNangMoi`)
3. Commit changes (`git commit -m 'Thêm tính năng mới'`)
4. Push lên branch (`git push origin feature/TinhNangMoi`)
5. Tạo Pull Request

## License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo Issue trên GitHub.
