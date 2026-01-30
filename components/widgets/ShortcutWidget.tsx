import React, { useState } from 'react';
import { QrCode, Link as LinkIcon, Copy, Check, ArrowRight, Download, RefreshCw, ExternalLink } from 'lucide-react';

export const ShortcutWidget: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [result, setResult] = useState<{ short?: string; original: string; qr: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    
    setLoading(true);
    let urlToProcess = inputUrl.trim();
    if (!/^https?:\/\//i.test(urlToProcess)) {
        urlToProcess = 'https://' + urlToProcess;
    }

    // Generate QR via public API
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(urlToProcess)}`;

    // Attempt Shortener (TinyURL)
    // Note: Cross-Origin restrictions might block this on some networks/browsers.
    // We implement a try/catch to gracefully handle failure by just showing the original URL.
    let shortUrl = '';
    try {
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlToProcess)}`);
        if (res.ok) {
            const text = await res.text();
            if (text.startsWith('http')) {
                shortUrl = text;
            }
        }
    } catch (e) {
        console.log("Shortener unavailable, using original link.");
    }

    setResult({
        original: urlToProcess,
        short: shortUrl,
        qr: qr
    });
    setLoading(false);
  };

  const copyToClipboard = () => {
      if (result?.short) {
          navigator.clipboard.writeText(result.short);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  const downloadQr = async () => {
    if (!result?.qr) return;
    try {
        const response = await fetch(result.qr);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'classroom-qr.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        // Fallback for simple open in new tab if fetch fails due to CORS
        window.open(result.qr, '_blank');
    }
  };

  return (
     <div className="h-full flex flex-col items-center justify-center p-4">
        {/* Card Container */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border-8 border-gray-100 relative overflow-hidden transform rotate-1 transition-transform hover:rotate-0 duration-300">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4 shadow-inner border-2 border-blue-200">
                    <QrCode size={32} />
                </div>
                <h2 className="font-chalk text-3xl text-gray-800">Quick Link</h2>
                <p className="font-child text-gray-500">Generate a QR Code & Short Link</p>
            </div>

            {/* Input Form */}
            {!result ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="relative group">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            placeholder="Paste your long link here..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-child text-lg focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
                            autoFocus
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold font-child py-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {loading ? <RefreshCw className="animate-spin" /> : <ArrowRight />}
                        {loading ? 'Generating...' : 'Create Shortcut'}
                    </button>
                </form>
            ) : (
                <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-300">
                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-xl border-4 border-gray-100 shadow-inner group relative">
                        <img src={result.qr} alt="QR Code" className="w-48 h-48 object-contain" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg"></div>
                    </div>

                    {/* Links */}
                    <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-200 text-center relative">
                        {result.short ? (
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-child text-gray-400 uppercase font-bold tracking-wider">Short Link</span>
                                <div className="flex items-center gap-2 justify-center">
                                    <a href={result.short} target="_blank" rel="noreferrer" className="text-blue-600 font-bold font-child text-2xl hover:underline truncate">
                                        {result.short}
                                    </a>
                                    <button 
                                        onClick={copyToClipboard}
                                        className="p-2 hover:bg-blue-100 rounded-lg text-blue-500 transition-colors active:scale-90"
                                        title="Copy to clipboard"
                                    >
                                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                             <div className="flex flex-col gap-1">
                                <span className="text-xs font-child text-gray-400 uppercase font-bold tracking-wider">Original Link</span>
                                <a href={result.original} target="_blank" rel="noreferrer" className="text-gray-600 font-bold font-child text-sm truncate hover:underline block max-w-[250px] mx-auto">
                                    {result.original}
                                </a>
                                <p className="text-xs text-orange-400 font-child mt-1">(Link shortening unavailable)</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 w-full">
                         <button 
                            onClick={() => setResult(null)}
                            className="flex-1 py-2 rounded-xl border-2 border-gray-200 font-child font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={16} /> New
                        </button>
                        <button 
                            onClick={downloadQr}
                            className="flex-1 py-2 rounded-xl bg-gray-800 text-white font-child font-bold flex items-center justify-center gap-2 hover:bg-gray-900 shadow-md transition-colors active:translate-y-0.5"
                        >
                           <Download size={18} /> Save QR
                        </button>
                    </div>
                </div>
            )}
        </div>
     </div>
  );
};