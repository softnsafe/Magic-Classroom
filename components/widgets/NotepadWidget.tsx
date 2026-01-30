import React, { useState, useEffect, useRef } from 'react';
import { X, GripHorizontal, Bold, Italic, Underline, Palette, List, Type, Save, Upload, FilePlus, Undo, Redo, Minus, Square } from 'lucide-react';

interface NotepadWidgetProps {
  onClose: () => void;
}

export const NotepadWidget: React.FC<NotepadWidgetProps> = ({ onClose }) => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 500, height: 600 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const isResizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('classroom-notepad-html');
    if (saved && editorRef.current) {
        editorRef.current.innerHTML = saved;
        updateStats();
    }
  }, []);

  // Save to local storage on blur
  const handleBlur = () => {
    if (editorRef.current) {
        localStorage.setItem('classroom-notepad-html', editorRef.current.innerHTML);
        updateStats();
    }
  };

  const updateStats = () => {
      if (editorRef.current) {
          const text = editorRef.current.innerText || "";
          setWordCount(text.trim().split(/\s+/).filter(w => w.length > 0).length);
      }
  };

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking the header
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
    e.preventDefault();
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
        width: Math.max(300, startSize.current.width + deltaX),
        height: Math.max(300, startSize.current.height + deltaY)
    });
  };

  const handleResizeEnd = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Formatting Logic
  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateStats();
  };

  const preventFocusLoss = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // File Operations
  const handleNewFile = () => {
      if (window.confirm("Start a new document? Unsaved changes will be lost.")) {
          if (editorRef.current) editorRef.current.innerHTML = "";
          handleBlur();
      }
  };

  const handleSaveFile = () => {
      if (!editorRef.current) return;
      const content = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>My Document</title></head>
        <body style="font-family: sans-serif;">${editorRef.current.innerHTML}</body>
        </html>
      `;
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-classroom-doc.html';
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (editorRef.current) {
                  // Basic extraction of body content if it's a full HTML file
                  const content = ev.target?.result as string;
                  const parser = new DOMParser();
                  const doc = parser.parseFromString(content, 'text/html');
                  const body = doc.body.innerHTML;
                  // If body is empty (e.g. plain text), use raw content
                  editorRef.current.innerHTML = body || content;
                  handleBlur();
              }
          };
          reader.readAsText(file);
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const colors = [
      '#000000', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#f97316', '#64748b'
  ];

  return (
    <div 
      className="fixed z-50 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col font-sans"
      style={{ 
        left: position.x, 
        top: position.y,
        width: size.width,
        height: size.height
      }}
    >
      {/* Window Title Bar */}
      <div 
        className="bg-blue-600 h-9 rounded-t-lg flex items-center justify-between px-3 cursor-move relative z-10 shrink-0 select-none shadow-sm"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-white">
          <FilePlus size={16} />
          <span className="text-xs font-bold tracking-wide">Magic Word Processor</span>
        </div>
        <div className="flex items-center gap-1">
            <button className="text-blue-200 hover:bg-blue-500 hover:text-white rounded p-0.5"><Minus size={14} /></button>
            <button className="text-blue-200 hover:bg-blue-500 hover:text-white rounded p-0.5"><Square size={12} /></button>
            <button 
            onClick={onClose}
            className="text-blue-100 hover:bg-red-500 hover:text-white rounded p-0.5 transition-colors ml-1"
            onMouseDown={(e) => e.stopPropagation()}
            >
            <X size={16} />
            </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="bg-gray-100 border-b border-gray-300 px-2 py-1 flex items-center gap-4 text-sm text-gray-700 select-none">
          <div className="flex gap-2">
            <button onClick={handleNewFile} className="hover:bg-gray-200 px-2 rounded">New</button>
            <button onClick={() => fileInputRef.current?.click()} className="hover:bg-gray-200 px-2 rounded">Open</button>
            <button onClick={handleSaveFile} className="hover:bg-gray-200 px-2 rounded">Save</button>
          </div>
          <div className="w-[1px] h-4 bg-gray-300"></div>
          <div className="text-xs text-gray-500">
             {wordCount} words
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept=".html,.txt" onChange={handleOpenFile} />
      </div>

      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 px-2 py-2 flex items-center gap-1 flex-wrap z-10">
        <div className="flex gap-0.5 bg-white border border-gray-300 rounded p-0.5 shadow-sm">
            <button onMouseDown={preventFocusLoss} onClick={() => execCmd('undo')} className="p-1.5 hover:bg-blue-50 rounded text-gray-700" title="Undo"><Undo size={14} /></button>
            <button onMouseDown={preventFocusLoss} onClick={() => execCmd('redo')} className="p-1.5 hover:bg-blue-50 rounded text-gray-700" title="Redo"><Redo size={14} /></button>
        </div>

        <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>

        <div className="flex gap-0.5 bg-white border border-gray-300 rounded p-0.5 shadow-sm">
            <button onMouseDown={preventFocusLoss} onClick={() => execCmd('bold')} className="p-1.5 hover:bg-blue-50 rounded text-gray-700" title="Bold"><Bold size={14} /></button>
            <button onMouseDown={preventFocusLoss} onClick={() => execCmd('italic')} className="p-1.5 hover:bg-blue-50 rounded text-gray-700" title="Italic"><Italic size={14} /></button>
            <button onMouseDown={preventFocusLoss} onClick={() => execCmd('underline')} className="p-1.5 hover:bg-blue-50 rounded text-gray-700" title="Underline"><Underline size={14} /></button>
        </div>
        
        <div className="flex gap-0.5 bg-white border border-gray-300 rounded p-0.5 shadow-sm ml-1">
            <button onMouseDown={preventFocusLoss} onClick={() => execCmd('fontSize', '3')} className="p-1.5 hover:bg-blue-50 rounded text-gray-700 text-xs font-bold w-8" title="Normal">12</button>
            <button onMouseDown={preventFocusLoss} onClick={() => execCmd('fontSize', '5')} className="p-1.5 hover:bg-blue-50 rounded text-gray-700 text-sm font-bold w-8" title="Large">18</button>
            <button onMouseDown={preventFocusLoss} onClick={() => execCmd('fontSize', '7')} className="p-1.5 hover:bg-blue-50 rounded text-gray-700 text-base font-bold w-8" title="Huge">24</button>
        </div>

        <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>

        <div className="relative">
             <button 
                onMouseDown={preventFocusLoss} 
                onClick={() => setShowColorPicker(!showColorPicker)} 
                className="p-1.5 hover:bg-blue-50 rounded text-gray-700 border border-transparent hover:border-gray-300"
                title="Text Color"
             >
                <Palette size={16} />
             </button>
             {showColorPicker && (
                 <div className="absolute top-full left-0 mt-1 bg-white p-2 rounded shadow-xl border border-gray-200 flex gap-1 z-50 w-32 flex-wrap">
                     {colors.map(c => (
                         <button 
                            key={c}
                            onMouseDown={preventFocusLoss}
                            onClick={() => { execCmd('foreColor', c); setShowColorPicker(false); }}
                            className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                            style={{ backgroundColor: c }}
                         />
                     ))}
                 </div>
             )}
        </div>

        <button onMouseDown={preventFocusLoss} onClick={() => execCmd('insertUnorderedList')} className="p-1.5 hover:bg-blue-50 rounded text-gray-700 border border-transparent hover:border-gray-300" title="Bullet List"><List size={16} /></button>
      </div>

      {/* Editor Body */}
      <div className="bg-gray-200 relative flex-1 border-x border-b border-gray-400 rounded-b-lg overflow-hidden flex flex-col p-4">
        {/* Paper Sheet */}
        <div 
            className="bg-white w-full h-full shadow-lg mx-auto flex flex-col overflow-hidden"
            style={{ maxWidth: '800px' }}
        >
            <div 
            ref={editorRef}
            contentEditable
            onBlur={handleBlur}
            onInput={updateStats}
            className="w-full h-full p-8 outline-none overflow-y-auto text-gray-800 font-serif text-lg leading-relaxed cursor-text"
            style={{
                minHeight: '100px',
            }}
            />
        </div>

        {/* Resize Handle */}
        <div 
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-20 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors bg-gray-200 rounded-tl"
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