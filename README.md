# 📖 Flipbook Maker - Free PDF Flipbook Creator

A modern, fast, and free web application to convert PDFs into beautiful interactive flipbooks. Built with React, TypeScript, and TailwindCSS.

## ✨ Features

### Core Functionality
- **Single Page Webapp** - No authentication or login required
- **PDF Upload** - Drag & drop or click to upload PDF files
- **Fast Loading** - Optimized PDF rendering with lazy loading
- **Realistic Animations** - Smooth page flip animations
- **Shareable Links** - Generate unique links for each flipbook
- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop

### Viewer Features
- **Page Navigation** - Arrow keys, buttons, thumbnails, and page number input
- **Zoom Controls** - Zoom in/out (50% to 300%)
- **Fullscreen Mode** - Immersive viewing experience
- **Thumbnail Bar** - Quick navigation with page thumbnails
- **Progress Indicator** - Real-time loading progress
- **Page Counter** - Shows current page and total pages
- **Download** - Download the original PDF
- **Share** - Copy shareable link to clipboard
- **Keyboard Shortcuts** - Arrow keys, Home, End for navigation

### Performance Optimizations
- **Lazy Loading** - Pages load on-demand as you navigate
- **Preloading** - Adjacent pages preload for smooth navigation
- **Canvas Rendering** - Fast PDF-to-image conversion
- **Image Caching** - Rendered pages are cached for instant access
- **Virtual Scrolling** - Efficient thumbnail rendering

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

1. **Clone or download the project**
```bash
cd "Flipbook 2"
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready to deploy to:
- GitHub Pages
- Vercel
- Netlify
- Any static hosting service

## 📁 Project Structure

```
Flipbook 2/
├── src/
│   ├── components/
│   │   ├── PDFUpload.tsx          # Drag & drop PDF upload component
│   │   ├── FlipbookViewer.tsx     # Main flipbook viewer with all controls
│   │   ├── ThumbnailBar.tsx       # Thumbnail navigation bar
│   │   └── ShareModal.tsx         # Share link modal
│   ├── utils/
│   │   ├── pdfUtils.ts            # PDF.js wrapper for fast rendering
│   │   └── storage.ts             # localStorage management for flipbooks
│   ├── types.ts                   # TypeScript type definitions
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── index.css                  # TailwindCSS styles
├── package.json
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # TailwindCSS configuration
└── tsconfig.json                  # TypeScript configuration
```

## 🔧 How It Works

### 1. PDF Upload & Processing
- User uploads a PDF file via drag & drop or file picker
- PDF is loaded using PDF.js library
- First page is rendered immediately for fast initial display
- Metadata (page count, name) is stored in localStorage

### 2. Lazy Loading Strategy
- **Initial Load**: Only the first page is rendered
- **On Navigation**: Current page loads if not cached
- **Preloading**: Pages before/after current page load in background
- **Thumbnails**: Load on-demand when visible in thumbnail bar

### 3. Performance Optimizations
- **Canvas Rendering**: PDF pages rendered to canvas at 2x scale for quality
- **Image Caching**: Rendered pages converted to JPEG images and cached
- **Virtual Scrolling**: Thumbnails use Intersection Observer for lazy loading
- **Progressive Loading**: Pages load progressively, not all at once

### 4. Storage & Sharing
- Flipbook metadata stored in browser localStorage
- Unique IDs generated for each flipbook
- Shareable links use URL hash: `/#/flipbook/{id}`
- Note: PDF files themselves are not stored (would require backend/IndexedDB)

## 🎨 Customization

### Styling
The app uses TailwindCSS. Modify `tailwind.config.js` to customize:
- Colors
- Animations
- Spacing
- Typography

### PDF Rendering Quality
In `src/utils/pdfUtils.ts`, adjust the `scale` parameter:
```typescript
const scale = 2.0; // Higher = better quality, slower rendering
```

### Preload Range
Control how many pages preload around current page:
```typescript
preloadPages(pdf, currentPage, totalPages, 2); // Last param = pages to preload
```

## 🐛 Troubleshooting

### PDF Not Loading
- Check browser console for errors
- Ensure PDF file is valid and not corrupted
- Try a smaller PDF file first

### Slow Performance
- Reduce preload range in `pdfUtils.ts`
- Lower the scale/quality setting
- Check browser memory usage

### Share Links Not Working
- Ensure you're using hash routing (`#/flipbook/{id}`)
- Check localStorage is enabled in browser
- Links only work in the same browser (localStorage limitation)

## 🚧 Future Enhancements

Potential features to add:
- [ ] Backend API for persistent storage
- [ ] IndexedDB for storing PDF files
- [ ] Text search within PDF
- [ ] Bookmark/favorite pages
- [ ] Print functionality
- [ ] Custom themes
- [ ] Page annotations
- [ ] Analytics tracking

## 📝 License

Free to use and modify. No restrictions.

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

---

**Built with ❤️ using React, TypeScript, TailwindCSS, and PDF.js**

