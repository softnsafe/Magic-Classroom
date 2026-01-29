import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Trash2, Pencil } from 'lucide-react';

export const DrawingWidget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff'); // Default white chalk
  const [lineWidth, setLineWidth] = useState(4);
  const [tool, setTool] = useState<'chalk' | 'eraser'>('chalk');

  // Colors suitable for a chalkboard
  const colors = [
    { hex: '#ffffff', label: 'White' },
    { hex: '#fca5a5', label: 'Red' }, // pastel red
    { hex: '#fde047', label: 'Yellow' }, // pastel yellow
    { hex: '#93c5fd', label: 'Blue' }, // pastel blue
    { hex: '#86efac', label: 'Green' }, // pastel green
  ];

  // Initialize canvas size
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        // Save current content
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        if (ctx && tempCtx) tempCtx.drawImage(canvas, 0, 0);

        // Resize
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Restore content (might be stretched/cropped, but better than losing it)
        if (ctx) ctx.drawImage(tempCanvas, 0, 0);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.beginPath(); // Reset path
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    ctx.lineWidth = tool === 'eraser' ? 30 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (tool === 'eraser') {
       // "Erase" by drawing with a partially transparent color similar to the board, 
       // or utilizing globalCompositeOperation for true transparency.
       // However, for a chalkboard, a "smudge" effect is often nicer.
       // Let's stick to true erasing for utility.
       ctx.globalCompositeOperation = 'destination-out';
    } else {
       ctx.globalCompositeOperation = 'source-over';
       ctx.strokeStyle = color;
       // Add a shadow to simulate chalk dust
       ctx.shadowBlur = 1;
       ctx.shadowColor = color;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
        className={`w-full h-full cursor-none touch-none ${tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
      />

      {/* Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md p-2 rounded-2xl border-2 border-white/20 shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
        
        {/* Colors */}
        <div className="flex gap-2 border-r border-white/20 pr-4">
            {colors.map((c) => (
                <button
                    key={c.hex}
                    onClick={() => { setColor(c.hex); setTool('chalk'); }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c.hex && tool === 'chalk' ? 'border-white scale-125' : 'border-transparent'}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                />
            ))}
        </div>

        {/* Tools */}
        <div className="flex gap-2">
            <button
                onClick={() => setTool('chalk')}
                className={`p-2 rounded-lg text-white transition-colors ${tool === 'chalk' ? 'bg-blue-600' : 'hover:bg-white/10'}`}
                title="Chalk"
            >
                <Pencil size={24} />
            </button>
            <button
                onClick={() => setTool('eraser')}
                className={`p-2 rounded-lg text-white transition-colors ${tool === 'eraser' ? 'bg-blue-600' : 'hover:bg-white/10'}`}
                title="Eraser"
            >
                <Eraser size={24} />
            </button>
            <div className="w-[1px] bg-white/20 h-8 mx-1"></div>
            <button
                onClick={clearBoard}
                className="p-2 rounded-lg text-red-400 hover:bg-red-900/50 transition-colors"
                title="Clear Drawing"
            >
                <Trash2 size={24} />
            </button>
        </div>
      </div>
    </div>
  );
};