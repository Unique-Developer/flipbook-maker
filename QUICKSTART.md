# 🚀 Quick Start Guide

Get your Flipbook Maker running in 3 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- React & React DOM
- TypeScript
- TailwindCSS
- PDF.js (for PDF rendering)
- Vite (build tool)

## Step 2: Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 3: Open in Browser

Navigate to `http://localhost:3000`

## Step 4: Test It Out!

1. **Upload a PDF**: Drag & drop a PDF file or click to browse
2. **Navigate**: Use arrow keys, buttons, or thumbnails
3. **Zoom**: Use +/- buttons or scroll
4. **Fullscreen**: Click the fullscreen button
5. **Share**: Click share to get a link

## 🎯 What to Expect

### First Time Loading a PDF:
- **Progress bar** shows loading status
- **First page** appears in 200-500ms
- **Background preloading** happens automatically

### Navigation:
- **Cached pages**: Instant (<50ms)
- **Uncached pages**: 100-300ms to load
- **Smooth animations**: Page flip effect

### Performance Tips:
- Start with smaller PDFs (<10MB) to test
- Larger PDFs work but may take longer initially
- Pages load faster after first view (cached)

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### PDF not loading
- Check browser console (F12) for errors
- Ensure PDF file is valid
- Try a different PDF file

### Port 3000 already in use
```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3001
```

### Slow performance
- Check browser memory usage
- Try a smaller PDF first
- Close other browser tabs

## 📦 Build for Production

```bash
npm run build
```

Output will be in `dist/` folder. Deploy to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag `dist` folder to Netlify
- **GitHub Pages**: See deployment guide

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

### Adjust PDF Quality
Edit `src/utils/pdfUtils.ts`:
```typescript
const scale = 2.0; // Change to 1.5 for faster, 3.0 for higher quality
```

### Change Preload Range
Edit `src/components/FlipbookViewer.tsx`:
```typescript
preloadPages(pdf, pageNum, totalPages, 2); // Change 2 to 1-5
```

## 📚 Next Steps

- Read [README.md](./README.md) for full documentation
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Customize the UI to match your brand
- Add your own features!

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Dev server running
- [ ] Can upload PDF
- [ ] Can navigate pages
- [ ] Zoom works
- [ ] Fullscreen works
- [ ] Share link works

---

**Happy Flipping! 📖**

