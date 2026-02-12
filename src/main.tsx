import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Configure PDF.js worker for better performance
import * as pdfjsLib from 'pdfjs-dist'

// Use local worker file from public folder
// This is more reliable than CDN and works offline
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

