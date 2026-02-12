import { useState, useEffect } from 'react';
import PDFUpload from './components/PDFUpload';
import FlipbookViewer from './components/FlipbookViewer';
import { generateFlipbookId, saveFlipbook } from './utils/storage';
import { loadPDF } from './utils/pdfUtils';

function App() {
  const [currentPDF, setCurrentPDF] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Shared-view state for permanent GitHub-hosted PDFs
  const [sharedPdfUrl, setSharedPdfUrl] = useState<string | null>(null);
  const [sharedTitle, setSharedTitle] = useState<string | undefined>(undefined);

  // Check for shared view in URL hash: #/view?pdf=...&title=...
  useEffect(() => {
    const hash = window.location.hash; // e.g. "#/view?pdf=...&title=..."
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

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Load PDF locally to get page count for UX (fast, no backend dependency)
      const pdf = await loadPDF(file);
      const totalPages = pdf.numPages;
      
      // Optionally store metadata locally
      const id = generateFlipbookId();
      saveFlipbook({
        id,
        name: file.name,
        totalPages,
        createdAt: Date.now(),
      });

      // If a backend upload URL is configured, upload to GitHub via Vercel function
      const backendEndpoint = import.meta.env.VITE_BACKEND_URL;

      if (backendEndpoint) {
        const response = await fetch(backendEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/pdf',
            'X-Filename': file.name,
          },
          body: file,
        });

        if (!response.ok) {
          throw new Error(`Backend upload failed: ${response.status}`);
        }

        const data: { pdfUrl: string; viewerUrl: string; title: string } = await response.json();

        // Go directly to the permanent viewer URL produced by the backend
        window.location.href = data.viewerUrl;
        return;
      }
      
      // Fallback: no backend configured, keep local-only viewer
      setCurrentPDF(file);
    } catch (error) {
      console.error('Error processing or uploading PDF:', error);
      alert('Failed to process or upload PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseViewer = () => {
    setCurrentPDF(null);
    window.location.hash = '';
  };

  const handleCloseSharedViewer = () => {
    setSharedPdfUrl(null);
    setSharedTitle(undefined);
    window.location.hash = '';
  };

  // If opened via share link (permanent GitHub-hosted PDF)
  if (sharedPdfUrl) {
    return (
      <FlipbookViewer
        pdfUrl={sharedPdfUrl}
        title={sharedTitle}
        onClose={handleCloseSharedViewer}
      />
    );
  }

  // If a local PDF has been uploaded in this session
  if (currentPDF) {
    return (
      <FlipbookViewer 
        pdfFile={currentPDF}
        onClose={handleCloseViewer} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            📖 Flipbook Maker
          </h1>
          <p className="text-xl text-gray-600">
            Transform your PDFs into beautiful, interactive flipbooks
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Free • Fast • No Sign-up Required
          </p>
        </header>

        {/* Upload Area */}
        <PDFUpload onUpload={handleUpload} isProcessing={isProcessing} />

        {/* Features List */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: 'Fast Loading', desc: 'Optimized PDF rendering with lazy loading' },
              { icon: '📱', title: 'Responsive', desc: 'Works on mobile, tablet, and desktop' },
              { icon: '🎨', title: 'Beautiful UI', desc: 'Modern, clean interface' },
              { icon: '🔍', title: 'Zoom & Pan', desc: 'Zoom in/out and navigate easily' },
              { icon: '🔗', title: 'Shareable Links', desc: 'Generate links to share your flipbooks' },
              { icon: '💾', title: 'Download', desc: 'Download your flipbook as PDF' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600 text-sm">
          <p>Made with ❤️ - Free Flipbook Maker</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

