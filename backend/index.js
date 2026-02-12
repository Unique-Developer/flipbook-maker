import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// CORS: allow your frontend origins (GitHub Pages + local dev)
const allowedOrigins = [
  'https://unique-developer.github.io',
  'https://unique-developer.github.io/flipbook-maker',
  'http://localhost:3000',
];

app.use(cors({
  origin(origin, callback) {
    // Allow requests without Origin (e.g. curl, server-to-server) and allowed frontends
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const PORT = process.env.PORT || 4000;

// GitHub configuration - set these in your backend host environment
const GITHUB_OWNER = process.env.GITHUB_OWNER;          // e.g. "Unique-Developer"
const GITHUB_REPO = process.env.GITHUB_REPO;            // e.g. "flipbook-assets"
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;          // PAT with repo scope

// Frontend base URL for generating viewer links, e.g. "https://unique-developer.github.io/flipbook-maker/"
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000/';

if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) {
  console.warn(
    'Warning: GITHUB_OWNER, GITHUB_REPO, or GITHUB_TOKEN not set. ' +
    'Upload endpoint will not work until these are configured.'
  );
}

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Flipbook backend is running' });
});

// Handle preflight for upload endpoint
app.options('/upload', cors());

/**
 * POST /upload
 * Uploads a PDF to the configured GitHub repo and returns:
 * - pdfUrl: direct raw URL to the PDF
 * - viewerUrl: flipbook viewer URL using that PDF
 */
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) {
      return res.status(500).json({ error: 'GitHub environment variables not configured' });
    }

    const file = req.file;
    const title = req.body.title || file?.originalname || 'Flipbook';

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Build a unique path for the PDF in the repo, e.g. "catalogue/2025-02-12-123456-sora.pdf"
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `catalogue/${timestamp}-${safeName}`;

    const contentBase64 = file.buffer.toString('base64');

    const githubApiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(
      path
    )}`;

    const githubResponse = await fetch(githubApiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'User-Agent': 'flipbook-backend',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({
        message: `Add flipbook PDF ${file.originalname}`,
        content: contentBase64,
        branch: GITHUB_BRANCH,
      }),
    });

    if (!githubResponse.ok) {
      const errorBody = await githubResponse.text();
      console.error('GitHub API error:', githubResponse.status, errorBody);
      return res.status(500).json({ error: 'Failed to upload to GitHub', details: errorBody });
    }

    // Construct raw URL to the uploaded PDF
    const pdfUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;

    // Construct viewer URL for your frontend
    const url = new URL(FRONTEND_BASE_URL);
    url.hash = `#/view?pdf=${encodeURIComponent(pdfUrl)}&title=${encodeURIComponent(title)}`;
    const viewerUrl = url.toString();

    return res.json({
      pdfUrl,
      viewerUrl,
      title,
      path,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Flipbook backend listening on port ${PORT}`);
});


