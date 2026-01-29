import React, { useState } from 'react';
import { ArrowRight, Info, AlertCircle, RotateCcw } from 'lucide-react';

interface EmbedWidgetProps {
  type: 'YOUTUBE' | 'SLIDES' | 'PDF' | 'WEBSITE';
}

export const EmbedWidget: React.FC<EmbedWidgetProps> = ({ type }) => {
  const [url, setUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) return;
    
    let finalUrl = url.trim();

    // Basic protocol check
    if (!finalUrl.match(/^https?:\/\//i)) {
        finalUrl = 'https://' + finalUrl;
    }

    if (type === 'YOUTUBE') {
      // Robust Regex for YouTube URLs (Watch, Short, Embed, Share)
      const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
      const match = finalUrl.match(regExp);
      
      if (match && match[2].length === 11) {
        const videoId = match[2];
        
        // Params based on YouTube Player Demo and Best Practices
        // Note: Removed 'origin' and 'enablejsapi' to ensure wider compatibility 
        // across different hosting environments (localhost, sandboxes, etc.)
        const params = new URLSearchParams({
            autoplay: '1',
            playsinline: '1',
            rel: '0',            // Limit related videos to same channel
            modestbranding: '1', // Minimal branding
            controls: '1',       // Always show controls
            fs: '1',             // Allow fullscreen
            iv_load_policy: '3', // Hide annotations
            disablekb: '0'       // Enable keyboard
        });

        finalUrl = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
      } else {
        setError('Could not find a valid Video ID. Please check the link.');
        return;
      }
    } 
    else if (type === 'SLIDES') {
      // Google Slides "edit" to "embed" auto-fix
      if (finalUrl.includes('docs.google.com/presentation') && finalUrl.includes('/edit')) {
         finalUrl = finalUrl.replace(/\/edit.*/, '/embed?start=false&loop=false&delayms=3000');
      }
    }
    else if (type === 'PDF') {
       // Force usage of Google Viewer for the PDF widget
       finalUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(finalUrl)}&embedded=true`;
    }
    else if (type === 'WEBSITE') {
       // Generic replacement for Google Docs to preview mode
       if (finalUrl.includes('docs.google.com/document') && finalUrl.includes('/edit')) {
         finalUrl = finalUrl.replace(/\/edit.*/, '/preview');
       }
    }

    setActiveUrl(finalUrl);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {!activeUrl ? (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl max-w-xl w-full border-4 border-gray-100 relative">
          {error && (
            <div className="absolute -top-12 left-0 right-0 bg-red-100 border-2 border-red-400 text-red-700 px-4 py-2 rounded-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
                <AlertCircle size={20} />
                <span className="font-child font-bold">{error}</span>
            </div>
          )}

          <div className="text-center mb-6">
            <h3 className="font-chalk text-3xl text-gray-800 mb-2">
              {type === 'YOUTUBE' && 'YouTube Video'}
              {type === 'SLIDES' && 'Google Slides'}
              {type === 'PDF' && 'PDF Document'}
              {type === 'WEBSITE' && 'Website'}
            </h3>
            <p className="text-gray-500 font-child">
               {type === 'YOUTUBE' && 'Paste a YouTube video link (Watch or Shorts).'}
               {type === 'SLIDES' && 'Paste a Google Slides link.'}
               {type === 'PDF' && 'Paste a link to a PDF file.'}
               {type === 'WEBSITE' && 'Paste any website URL.'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 font-child text-lg focus:outline-none focus:border-blue-400 transition-colors"
              placeholder={type === 'YOUTUBE' ? "https://youtube.com/..." : "https://..."}
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
            />
            <button type="submit" className="bg-blue-500 text-white px-6 rounded-lg hover:bg-blue-600 font-bold transition-transform active:scale-95">
              <ArrowRight size={24} />
            </button>
          </div>
          
          {type === 'SLIDES' && (
             <div className="mt-4 bg-blue-50 p-3 rounded-lg flex gap-3 text-sm text-blue-800 font-child items-start">
                <Info size={16} className="mt-1 shrink-0" />
                <p>Use the normal browser link. We'll auto-format it for presentation mode!</p>
             </div>
          )}
          {type === 'WEBSITE' && (
             <div className="mt-4 bg-yellow-50 p-3 rounded-lg flex gap-3 text-sm text-yellow-800 font-child items-start">
                <Info size={16} className="mt-1 shrink-0" />
                <p>Note: Some major websites (like Google or Wikipedia) block embedding.</p>
             </div>
          )}
        </form>
      ) : (
        <div className="w-full h-full flex flex-col relative group animate-in fade-in duration-500">
           {/* Controls - Always visible on top (better UX) */}
           <div className="absolute -top-12 right-0 z-50 flex gap-2">
              <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-xs backdrop-blur-md flex items-center shadow-sm">
                 <span className="truncate max-w-[200px] opacity-80">{activeUrl}</span>
              </div>
              <button 
                onClick={() => setActiveUrl('')}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-red-600 hover:scale-105 transition-all flex items-center gap-2"
              >
                <RotateCcw size={16} />
                <span>Change</span>
              </button>
           </div>
           
           <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-gray-800 w-full h-full relative">
             <iframe 
               key={activeUrl}
               src={activeUrl} 
               className="absolute inset-0 w-full h-full" 
               allowFullScreen
               title="Classroom Embed"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
               referrerPolicy="strict-origin-when-cross-origin"
               sandbox={type === 'WEBSITE' ? "allow-forms allow-scripts allow-same-origin allow-popups allow-presentation" : undefined}
             />
           </div>
        </div>
      )}
    </div>
  );
};