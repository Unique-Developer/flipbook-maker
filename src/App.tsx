import { useState, useEffect } from 'react';
import PDFUpload from './components/PDFUpload';
import FlipbookViewer from './components/FlipbookViewer';
import { generateFlipbookId, saveFlipbook, getFlipbookById } from './utils/storage';
import { loadPDF } from './utils/pdfUtils';

function App() {
  const [currentPDF, setCurrentPDF] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flipbookId, setFlipbookId] = useState<string | null>(null);

  // Check for flipbook ID in URL hash
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/\/flipbook\/([a-f0-9-]+)/);
    
    if (match) {
      const id = match[1];
      const flipbook = getFlipbookById(id);
      
      if (flipbook) {
        // In a real app, you'd load the PDF file from storage
        // For now, we'll just show a message that the flipbook was found
        setFlipbookId(id);
        // Note: Since we don't store the actual PDF file, we can't restore it
        // This would require a backend or IndexedDB for larger files
      }
    }
  }, []);

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Load PDF to get page count
      const pdf = await loadPDF(file);
      const totalPages = pdf.numPages;
      
      // Generate flipbook ID and save metadata (only metadata, not the File itself)
      const id = generateFlipbookId();
      saveFlipbook({
        id,
        name: file.name,
        totalPages,
        createdAt: Date.now(),
      });
      
      setFlipbookId(id);
      setCurrentPDF(file);
      
      // Update URL hash
      window.location.hash = `/flipbook/${id}`;
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Failed to process PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseViewer = () => {
    setCurrentPDF(null);
    setFlipbookId(null);
    window.location.hash = '';
  };

  if (currentPDF) {
    return (
      <FlipbookViewer 
        pdfFile={currentPDF} 
        flipbookId={flipbookId || undefined}
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

