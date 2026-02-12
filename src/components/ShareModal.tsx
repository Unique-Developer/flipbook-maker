import { useState, useEffect } from 'react';

interface ShareModalProps {
  initialPdfUrl?: string;
  defaultTitle?: string;
  onClose: () => void;
}

export default function ShareModal({ initialPdfUrl, defaultTitle, onClose }: ShareModalProps) {
  const [pdfUrl, setPdfUrl] = useState(initialPdfUrl ?? '');
  const [title, setTitle] = useState(defaultTitle ?? '');
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate share link whenever pdfUrl or title changes and pdfUrl is present
  useEffect(() => {
    if (!pdfUrl) {
      setShareLink('');
      return;
    }

    const base = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    params.set('pdf', pdfUrl);
    if (title) {
      params.set('title', title);
    }

    const link = `${base}#/view?${params.toString()}`;
    setShareLink(link);
  }, [pdfUrl, title]);

  const handleCopy = async () => {
    try {
      if (!shareLink) return;
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Share Flipbook</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Public PDF URL (e.g. GitHub-hosted)
            </label>
            <input
              type="text"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://unique-developer.github.io/flipbook-assets/my-catalog.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload your PDF to a public GitHub repo (e.g. <code>flipbook-assets</code>) and paste its raw URL here.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summer 2025 Catalogue"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                placeholder="Add a public PDF URL above to generate link"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
              <button
                onClick={handleCopy}
                disabled={!shareLink}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !shareLink
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : copied
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Anyone with this link can view your flipbook, even on a different device, as long as the PDF stays in your public GitHub repo.
          </p>
        </div>
      </div>
    </div>
  );
}

