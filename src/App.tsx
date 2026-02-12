import { useState, useEffect } from 'react';
import FlipbookViewer from './components/FlipbookViewer';

function App() {
  // State for URL-based viewing
  const [sharedPdfUrl, setSharedPdfUrl] = useState<string | null>(null);
  const [sharedTitle, setSharedTitle] = useState<string | undefined>(undefined);

  // Landing page form inputs
  const [pdfUrlInput, setPdfUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');

  // Parse URL hash: #/view?pdf=...&title=...
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/view')) {
      const [, queryString] = hash.split('?');
      const params = new URLSearchParams(queryString ?? '');
      const pdfParam = params.get('pdf');
      const titleParam = params.get('title');

      if (pdfParam) {
        setSharedPdfUrl(pdfParam);
        setSharedTitle(titleParam ?? undefined);
      }
    }
  }, []);

  const handleOpenFromForm = () => {
    const trimmedUrl = pdfUrlInput.trim();
    const trimmedTitle = titleInput.trim();
    if (!trimmedUrl) {
      alert('Please paste a public PDF URL (e.g. GitHub raw URL).');
      return;
    }

    const base = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    params.set('pdf', trimmedUrl);
    if (trimmedTitle) {
      params.set('title', trimmedTitle);
    }

    // Navigate to the viewer URL so this link can be copied and shared
    window.location.href = `${base}#/view?${params.toString()}`;
  };

  const handleCloseSharedViewer = () => {
    setSharedPdfUrl(null);
    setSharedTitle(undefined);
    window.location.hash = '';
  };

  // If opened via share link (permanent PDF URL), show viewer
  if (sharedPdfUrl) {
    return (
      <FlipbookViewer
        pdfUrl={sharedPdfUrl}
        title={sharedTitle}
        onClose={handleCloseSharedViewer}
      />
    );
  }

  // Otherwise show landing page with URL form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            📖 Flipbook Maker
          </h1>
          <p className="text-xl text-gray-600">
            Turn any public PDF link into a fast, interactive flipbook
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Paste your GitHub (or any public) PDF URL below to generate a shareable flipbook link.
          </p>
        </header>

        {/* URL Input Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Public PDF URL
            </label>
            <input
              type="text"
              value={pdfUrlInput}
              onChange={(e) => setPdfUrlInput(e.target.value)}
              placeholder="https://raw.githubusercontent.com/Unique-Developer/flipbook-assets/main/catalogue/sora.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload your PDF to a public GitHub repo (e.g. <code>flipbook-assets</code>), click <strong>Raw</strong>,
              and paste that URL here.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Summer 2025 Catalogue"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={handleOpenFromForm}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Open Flipbook
            </button>

            <div className="text-xs text-gray-500">
              The URL in your browser after clicking <strong>Open Flipbook</strong> is the link you can share
              on your website.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

