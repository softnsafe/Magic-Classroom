import React, { useState, useEffect, useRef } from 'react';
import { X, GripHorizontal } from 'lucide-react';

interface NotepadWidgetProps {
  onClose: () => void;
}

export const NotepadWidget: React.FC<NotepadWidgetProps> = ({ onClose }) => {
  const [text, setText] = useState('');
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 320, height: 400 });

  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const isResizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('classroom-notepad');
    if (saved) setText(saved);
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('classroom-notepad', text);
  }, [text]);

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if left click
    if (e.button !== 0) return;
    
    isDragging.current = true;
    const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Resizing Logic
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent text selection
    if (e.button !== 0) return;

    isResizing.current = true;
    resizeStart.current = { x: e.clientX, y: e.clientY };
    startSize.current = { width: size.width, height: size.height };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const deltaX = e.clientX - resizeStart.current.x;
    const deltaY = e.clientY - resizeStart.current.y;

    setSize({
        width: Math.max(250, startSize.current.width + deltaX), // Min width
        height: Math.max(200, startSize.current.height + deltaY) // Min height
    });
  };

  const handleResizeEnd = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  return (
    <div 
      className="fixed z-50 shadow-2xl animate-in zoom-in-90 duration-200 flex flex-col"
      style={{ 
        left: position.x, 
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      {/* Tape Effect */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-blue-400/80 rotate-1 shadow-sm z-20 pointer-events-none"></div>

      {/* Header / Drag Handle */}
      <div 
        className="bg-yellow-200 h-10 rounded-t-lg flex items-center justify-between px-3 border-x-2 border-t-2 border-yellow-400 cursor-move relative z-10 shrink-0"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-yellow-800 opacity-60">
          <GripHorizontal size={20} />
          <span className="font-child text-xs font-bold uppercase tracking-widest">Sticky Note</span>
        </div>
        <button 
          onClick={onClose}
          className="text-yellow-700 hover:bg-yellow-300 rounded p-1 transition-colors"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X size={18} />
        </button>
      </div>

      {/* Paper Body */}
      <div className="bg-yellow-50 relative flex-1 border-x-2 border-b-2 border-yellow-400 rounded-b-lg overflow-hidden">
        {/* Red Margin Line */}
        <div className="absolute top-0 bottom-0 left-8 w-[1px] bg-red-300 pointer-events-none z-10 h-full"></div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your notes here..."
          className="w-full h-full resize-none bg-transparent p-4 pl-10 font-child text-xl text-gray-700 leading-8 focus:outline-none"
          style={{
            backgroundImage: 'linear-gradient(transparent 96%, #94a3b8 96%, #94a3b8 100%)',
            backgroundSize: '100% 2rem',
            lineHeight: '2rem',
            paddingTop: '0.2rem' 
          }}
        />

        {/* Resize Handle */}
        <div 
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-20 flex items-center justify-center text-yellow-600/50 hover:text-yellow-800 transition-colors"
            onMouseDown={handleResizeStart}
        >
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                 <line x1="16" y1="20" x2="20" y2="16" />
                 <line x1="12" y1="20" x2="20" y2="12" />
             </svg>
        </div>
      </div>
    </div>
  );
};
