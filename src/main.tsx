import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Configure PDF.js worker for better performance
import * as pdfjsLib from 'pdfjs-dist'

// Use worker file from the app's base URL so it works on GitHub Pages too
// import.meta.env.BASE_URL will be '/flipbook-maker/' in production
pdfjsLib.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.mjs`

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

