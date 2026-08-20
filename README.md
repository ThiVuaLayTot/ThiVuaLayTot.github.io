# 🎯 Thí Vua Lấy Tốt - Website Chính Thức

[![Website Status](https://img.shields.io/website?url=https://thivualaytot-beta.github.io/)](https://thivualaytot-beta.github.io)
[![HTML Check](https://github.com/ThiVuaLayTot-beta/ThiVuaLayTot-beta.github.io/actions/workflows/html-check.yml/badge.svg?event=push)](https://github.com/ThiVuaLayTot-beta/ThiVuaLayTot-beta.github.io/actions)
[![Lighthouse CI](https://github.com/ThiVuaLayTot-beta/ThiVuaLayTot-beta.github.io/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/ThiVuaLayTot-beta/ThiVuaLayTot-beta.github.io/actions)
[![GitHub License](https://img.shields.io/github/license/ThiVuaLayTot-beta/ThiVuaLayTot-beta.github.io)](LICENSE)
[![Contributors](https://contrib.rocks/image?repo=ThiVuaLayTot-beta/ThiVuaLayTot-beta.github.io)](https://github.com/ThiVuaLayTot-beta/ThiVuaLayTot-beta.github.io/graphs/contributors)

🔗 **[https://thivualaytot-beta.github.io](https://thivualaytot-beta.github.io)**

---

## 📖 Mô Tả

Mã nguồn cho trang web chính thức của **Thí Vua Lấy Tốt (TVLT)** - một câu lạc bộ cờ vua cộng đồng trên Chess.com. 

Trang web được thiết kế hiện đại, tập trung vào:
- 🎨 **Giao diện Cinematic** - hiệu ứng nâng cao, responsive design
- ⚡ **Hiệu suất cao** - optimized CSS, JavaScript và hình ảnh
- 🏆 **Giải đấu & Sự kiện** - quản lý lịch thi đấu tập trung
- 💬 **Cộng đồng** - kết nối đa nền tảng (Chess.com, Lichess, Discord, Zalo, Facebook)
- 📱 **Mobile-first** - hoàn toàn responsive trên mọi thiết bị

---

## 🚀 Bắt Đầu Nhanh

### Yêu Cầu
- Node.js >= 16.0
- Ruby >= 2.7 (nếu sử dụng Jekyll)
- Git

### Cài Đặt Địa Phương

```bash
# Clone repository
git clone https://github.com/ThiVuaLayTot-beta/ThiVuaLayTot-beta.github.io.git
cd ThiVuaLayTot-beta.github.io

# Cài đặt dependencies
npm install
# hoặc với Ruby
bundle install

# Chạy development server
npm run dev
# hoặc với Jekyll
bundle exec jekyll serve --livereload
```

Truy cập `http://localhost:4000` để xem thay đổi real-time.

---

## 📁 Cấu Trúc Dự Án

```
ThiVuaLayTot-beta.github.io/
├── _includes/              # Thành phần HTML tái sử dụng
│   ├── head.html          # Meta tags, SEO
│   ├── navbar.html        # Thanh điều hướng
│   └── footer.html        # Phần cuối trang
├── _layouts/              # Layout mẫu (nếu sử dụng Jekyll)
├── _posts/                # Bài viết blog
├── assets/                # Tài nguyên (ảnh, fonts, icons)
│   ├── css/               # Stylesheets
│   │   ├── base.css       # Reset & variables chung
│   │   ├── components.css # Component styles
│   │   └── home.css       # Home page styles
│   └── js/                # JavaScript modules
├── .github/
│   └── workflows/         # GitHub Actions CI/CD
├── index.html             # Trang chủ
├── schedule.html          # Lịch thi đấu
├── leaders.md             # Leaderboard
├── contact.html           # Liên hệ
├── social.html            # Cộng đồng
├── package.json           # Dependencies & scripts
├── .eslintrc.json         # ESLint config
├── .stylelintrc.json      # Stylelint config
└── README.md              # File này
```

---

## 🛠️ Các Công Cụ & Quy Trình

### Linting & Code Quality

```bash
# ESLint - Kiểm tra JavaScript
npm run lint:js

# Stylelint - Kiểm tra CSS
npm run lint:css

# HTMLHint - Kiểm tra HTML
npm run lint:html

# Tất cả cùng lúc
npm run lint
```

### Build & Minify

```bash
# Build cho production
npm run build

# Watch mode - tự động build khi file thay đổi
npm run watch
```

### Testing

```bash
# Chạy HTML validation
npm run test:html

# Chạy Lighthouse audit
npm run test:lighthouse

# Tất cả tests
npm run test
```

---

## 🎨 Công Nghệ Sử Dụng

- **HTML5** - Semantic HTML, WAI-ARIA
- **CSS3** - Custom properties, Grid, Flexbox, Animations
- **JavaScript** - Vanilla JS (ES6+), no frameworks
- **Icons** - Boxicons
- **Fonts** - System fonts + Google Fonts
- **Build Tools** - Webpack/Vite (tuỳ chọn)
- **CI/CD** - GitHub Actions
- **Hosting** - GitHub Pages

---

## 📊 Performance

Trang được tối ưu cho:
- **Lighthouse Score**: 90+
- **Page Speed**: < 2s
- **Bundle Size**: < 500KB (gzipped)
- **Core Web Vitals**: All green

Kiểm tra thống kê tại: [PageSpeed Insights](https://pagespeed.web.dev/)

---

## 🔄 Git Workflow

### Branch Naming
```
feature/description         # Tính năng mới
bugfix/description          # Sửa bug
docs/description            # Cập nhật tài liệu
refactor/description        # Tái cấu trúc
chore/description          # Bảo trì
```

### Commit Messages
```
format: <type>: <description>

Types:
- feat:      Tính năng mới
- fix:       Sửa bug
- docs:      Thay đổi tài liệu
- style:     Format code (không ảnh hưởng logic)
- refactor:  Tái cấu trúc code
- perf:      Tối ưu hiệu suất
- test:      Thêm/sửa tests
- chore:     Build, dependencies
- ci:        CI/CD changes

Example: feat: add lighthouse CI integration
```

---

## 📋 Checklist Trước Khi Submit PR

- [ ] Code được linting (eslint, stylelint, htmlhint)
- [ ] Các tests pass (`npm run test`)
- [ ] Commit message rõ ràng
- [ ] Không có console errors
- [ ] Responsive trên mobile/tablet/desktop
- [ ] Lighthouse score >= 90
- [ ] Core Web Vitals đạt mức xanh
- [ ] Alt text cho hình ảnh
- [ ] Semantic HTML + ARIA labels

---

## 🤝 Hướng Dẫn Đóng Góp

### Quy Trình Đóng Góp

1. **Fork** repository này
2. **Tạo branch** mới: `git checkout -b feature/your-feature`
3. **Commit** thay đổi: `git commit -m "feat: your message"`
4. **Push** đến fork: `git push origin feature/your-feature`
5. **Mở Pull Request** với mô tả chi tiết

### Điều Khoản Đóng Góp

- Tuân theo code style của dự án
- Thêm tài liệu cho tính năng mới
- Cập nhật CHANGELOG.md
- Đảm bảo tất cả tests pass
- Không thêm dependencies mới mà không thảo luận

---

## 📝 Quy Tắc Thiết Kế

### CSS Architecture
- **BEM** - Block Element Modifier pattern
- **Mobile-first** - Responsive design
- **Custom properties** - CSS variables cho consistency
- **Modular** - Components độc lập, tái sử dụng

```css
/* Example */
.block { }
.block__element { }
.block__element--modifier { }
```

### JavaScript Best Practices
- ES6+ syntax
- Event delegation
- Performance monitoring
- Accessibility first

---

## 🔐 SEO & Accessibility

### SEO Essentials
- ✅ Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
- ✅ Meta tags (title, description, og:)
- ✅ Open Graph & Twitter Card
- ✅ Structured data (JSON-LD)
- ✅ XML sitemap
- ✅ robots.txt

### Accessibility (WCAG 2.1)
- ✅ Semantic HTML
- ✅ ARIA labels & roles
- ✅ Keyboard navigation
- ✅ Color contrast >= 4.5:1
- ✅ Alt text cho ảnh
- ✅ Skip links

---

## 🐛 Báo Cáo Bug

Phát hiện bug? Hãy [mở Issue](https://github.com/ThiVuaLayTot-beta/ThiVuaLayTot-beta.github.io/issues)

**Nêu rõ:**
- Mô tả bug
- Bước tái hiện
- Hành vi mong muốn
- Screenshots (nếu có)
- Environment (browser, OS)

---

## 💡 Đề Xuất Tính Năng

Có ý tưởng hay? [Tạo discussion](https://github.com/ThiVuaLayTot-beta/ThiVuaLayTot-beta.github.io/discussions)

---

## 📄 License

MIT License - xem [LICENSE](LICENSE) file

---

## 👥 Team

- **Founder**: TungJohn Playing Chess
- **Website Lead**: [Repository Contributors](https://github.com/ThiVuaLayTot-beta/ThiVuaLayTot-beta.github.io/graphs/contributors)

---

## 🌐 Liên Kết

- 🎮 [Chess.com Club](https://link.chess.com/club/0CVQh6)
- ♞ [Lichess Team](https://lichess.org/team/thi-vua-lay-tot-tungjohn-playing-chess)
- 📱 [Facebook Group](https://facebook.com/groups/586909589413729)
- 💬 [Discord Server](https://discord.gg/bggkufa4nE)
- 📲 [Zalo Group](https://zalo.me/g/zhrwtn779)
- ▶️ [YouTube Channel](https://youtube.com/@tungjohnplayingchess)

---

**Cơm Vua Lấy Tốt** 🎯♟️
