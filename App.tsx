import React, { useState, useRef, useEffect } from 'react';
import { Chalkboard } from './components/Chalkboard';
import { TodoList } from './components/TodoList';
import { WidgetDock } from './components/WidgetDock';
import { TimerWidget } from './components/widgets/TimerWidget';
import { EmbedWidget } from './components/widgets/EmbedWidget';
import { WheelWidget } from './components/widgets/WheelWidget';
import { NotepadWidget } from './components/widgets/NotepadWidget';
import { AlarmWidget } from './components/widgets/AlarmWidget';
import { CalendarWidget } from './components/widgets/CalendarWidget';
import { SoundboardWidget } from './components/widgets/SoundboardWidget';
import { DrawingWidget } from './components/widgets/DrawingWidget';
import { editImageWithGemini } from './services/geminiService';
import { WidgetType, AppStatus, ImageState } from './types';
import { Polaroid } from './components/Polaroid';
import { Upload, Sparkles, ListTodo, AlertTriangle, Eraser, ChevronLeft } from 'lucide-react';

const App: React.FC = () => {
  const [activeWidget, setActiveWidget] = useState<WidgetType>('NONE');
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [isTodoOpen, setIsTodoOpen] = useState(false);
  
  // Magic Art state
  const [magicImage, setMagicImage] = useState<ImageState | null>(null);
  const [magicResult, setMagicResult] = useState<ImageState | null>(null);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [magicStatus, setMagicStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle Paste for Magic Art
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (activeWidget !== 'MAGIC_ART') return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = (ev) => {
                 setMagicImage({ data: ev.target?.result as string, mimeType: blob.type });
                 setErrorMessage(''); 
                 setMagicResult(null); 
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeWidget]);

  const handleMagic = async () => {
    setErrorMessage('');
    
    if (!magicImage) {
        setErrorMessage("Please upload an image first!");
        return;
    }
    if (!magicPrompt.trim()) {
        setErrorMessage("Please type a magic spell (prompt)!");
        return;
    }

    setMagicStatus(AppStatus.LOADING);
    setMagicResult(null); 
    
    try {
      const res = await editImageWithGemini(magicImage, magicPrompt);
      if (res.image) {
        setMagicResult(res.image);
        setMagicStatus(AppStatus.SUCCESS);
      } else {
        throw new Error("No image was returned from the magic spell.");
      }
    } catch (e: any) {
      console.error(e);
      setMagicStatus(AppStatus.ERROR);
      setErrorMessage(e.message || "The magic fizzled out. Please check your API Key or try a different prompt.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
             setMagicImage({ data: ev.target?.result as string, mimeType: file.type });
             setErrorMessage(''); 
             setMagicResult(null); // Reset result on new upload
        };
        reader.readAsDataURL(file);
    }
  };

  const handleWidgetSelect = (type: WidgetType) => {
    if (type === 'NOTEPAD') {
      setIsNotepadOpen(prev => !prev);
    } else {
      setActiveWidget(prev => prev === type ? 'NONE' : type);
    }
  };

  const clearBoard = () => {
    setActiveWidget('NONE');
  };

  const renderWidget = () => {
    switch (activeWidget) {
      case 'DRAW':
        return <DrawingWidget key="drawing" />;
      case 'TIMER':
        return <TimerWidget key="timer" />;
      case 'ALARM':
        return <AlarmWidget key="alarm" />;
      case 'CALENDAR':
        return <CalendarWidget key="calendar" />;
      case 'SOUNDBOARD':
        return <SoundboardWidget key="soundboard" />;
      case 'YOUTUBE':
        return <EmbedWidget key="youtube" type="YOUTUBE" />;
      case 'SLIDES':
        return <EmbedWidget key="slides" type="SLIDES" />;
      case 'PDF':
        return <EmbedWidget key="pdf" type="PDF" />;
      case 'WEBSITE':
        return <EmbedWidget key="website" type="WEBSITE" />;
      case 'WHEEL':
        return <WheelWidget key="wheel" />;
      case 'MAGIC_ART':
        return (
          <div key="magic" className="flex gap-8 items-center h-full justify-center animate-in fade-in flex-wrap overflow-auto p-4 relative w-full">
             {/* Loading Overlay */}
             {magicStatus === AppStatus.LOADING && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
                    <div className="animate-spin text-purple-600 mb-4"><Sparkles size={48} /></div>
                    <p className="font-chalk text-2xl text-purple-800 animate-pulse">Casting spell...</p>
                </div>
             )}

             <div className="bg-white p-4 rounded-xl shadow-lg transform -rotate-1 max-w-sm w-full shrink-0 flex flex-col gap-3">
                <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer transition-opacity hover:opacity-90 group relative">
                  <Polaroid imageSrc={magicImage?.data || null} label="Source Image" placeholderIcon={<Upload size={48} />} />
                  {!magicImage && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="bg-black/50 text-white px-2 rounded text-sm font-child mt-12 shadow-sm border border-white/20 backdrop-blur-[1px]">Click or Paste Image</span></div>}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                
                <textarea 
                  value={magicPrompt} 
                  onChange={(e) => { setMagicPrompt(e.target.value); setErrorMessage(''); }}
                  placeholder="Type your magic spell here... (e.g., 'Make it snowy', 'Turn into a cartoon')"
                  className="w-full p-3 border-2 border-purple-200 rounded-lg font-child text-lg focus:outline-none focus:border-purple-400 bg-purple-50 resize-none h-24"
                />
                
                {errorMessage && (
                    <div className="text-red-600 font-child text-sm font-bold text-center bg-red-100 p-3 rounded-lg border-2 border-red-200 flex items-center gap-2 justify-center">
                        <AlertTriangle size={16} />
                        {errorMessage}
                    </div>
                )}

                <button 
                  onClick={handleMagic}
                  disabled={magicStatus === AppStatus.LOADING}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-chalk text-xl py-3 rounded-lg hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-md flex items-center justify-center gap-2"
                >
                   <Sparkles size={20} />
                   {magicStatus === AppStatus.LOADING ? 'Casting...' : 'Cast Magic!'}
                </button>
             </div>
             
             {/* Result Area */}
             {magicResult && (
               <div className="transform rotate-2 max-w-sm w-full shrink-0 animate-in zoom-in duration-500">
                 <Polaroid imageSrc={magicResult.data} label="Magical Result" color="bg-green-400" />
               </div>
             )}
          </div>
        );
      default:
        return (
          <div key="idle" className="h-full flex flex-col items-center justify-center text-white/20 select-none pointer-events-none">
             <div className="text-9xl mb-4 font-chalk opacity-20 text-center">Classroom</div>
             <p className="font-child text-2xl opacity-40 text-center">Select a tool from the side dock</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-orange-100 flex font-child relative">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cork-board.png")' }}></div>

      {isNotepadOpen && <NotepadWidget onClose={() => setIsNotepadOpen(false)} />}

      {/* Todo List Drawer - Left */}
      <div 
        className={`fixed left-0 top-16 bottom-32 z-40 transition-transform duration-300 ease-out flex ${isTodoOpen ? 'translate-x-0' : '-translate-x-[320px]'}`}
        onMouseEnter={() => setIsTodoOpen(true)}
        onMouseLeave={() => setIsTodoOpen(false)}
      >
         <div className="w-80 h-full p-4 pr-0">
             <TodoList />
         </div>
         <div 
            className="mt-8 h-14 bg-yellow-500 text-white rounded-r-xl shadow-md cursor-pointer flex items-center justify-center pl-1 pr-2 border-y-2 border-r-2 border-yellow-600 hover:bg-yellow-400 transition-colors"
            onClick={() => setIsTodoOpen(!isTodoOpen)}
            title="To-Do List"
         >
             <ListTodo size={28} />
         </div>
      </div>

      <div className="flex-1 h-full p-6 relative z-10 flex flex-col transition-all duration-300">
         <div className="relative w-full h-full flex flex-col">
            {/* Clear Board Button */}
            <button 
                onClick={clearBoard}
                className="absolute -top-3 -right-3 z-30 bg-white border-4 border-amber-900 rounded-full p-3 shadow-lg hover:bg-gray-100 hover:scale-110 active:scale-95 transition-all group"
                title="Clear Board"
            >
                <Eraser size={24} className="text-amber-900" />
                <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-child pointer-events-none">
                    Erase Board
                </span>
            </button>

            <Chalkboard className="w-full h-full flex flex-col">
                <div className="flex-1 min-h-0 relative">
                {renderWidget()}
                </div>
            </Chalkboard>
         </div>

         {/* Sidebar Dock - Right */}
         <div 
            className="fixed right-0 top-1/2 -translate-y-1/2 z-50 transform translate-x-[calc(100%-12px)] hover:translate-x-0 transition-transform duration-300 ease-in-out flex items-center"
         >
            {/* Grabber / Visual Cue */}
            <div className="h-24 w-8 bg-gray-200 rounded-l-lg shadow-md -mr-4 flex items-center justify-start pl-1 cursor-pointer">
                <ChevronLeft size={16} className="text-gray-500 animate-pulse" />
            </div>

            {/* Dock Content */}
            <div className="bg-white/90 backdrop-blur-sm border-l-4 border-y-4 border-gray-200 rounded-l-2xl p-2 shadow-2xl h-[90vh] overflow-y-auto w-48">
                <div className="mb-4 text-center border-b border-gray-300 pb-2">
                    <h3 className="font-chalk text-xl text-gray-500">Tools</h3>
                </div>
                <WidgetDock 
                  onSelect={handleWidgetSelect} 
                  activeWidget={activeWidget} 
                  isNotepadOpen={isNotepadOpen}
                />
            </div>
         </div>
      </div>
    </div>
  );
};

export default App;