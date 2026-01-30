import React from 'react';
import { WidgetType } from '../types';
import { Timer, Youtube, Presentation, Globe, Sparkles, CircleDashed, FileText, StickyNote, AlarmClock, Calendar, Megaphone, Pencil, QrCode } from 'lucide-react';

interface WidgetDockProps {
  onSelect: (type: WidgetType) => void;
  activeWidget: WidgetType;
  isNotepadOpen: boolean;
}

export const WidgetDock: React.FC<WidgetDockProps> = ({ onSelect, activeWidget, isNotepadOpen }) => {
  const tools = [
    { type: 'DRAW', icon: <Pencil />, label: 'Chalk' },
    { type: 'TIMER', icon: <Timer />, label: 'Timer' },
    { type: 'ALARM', icon: <AlarmClock />, label: 'Alarm' },
    { type: 'CALENDAR', icon: <Calendar />, label: 'Calendar' },
    { type: 'SOUNDBOARD', icon: <Megaphone />, label: 'Sounds' },
    { type: 'WHEEL', icon: <CircleDashed />, label: 'Wheel' },
    { type: 'SHORTCUT', icon: <QrCode />, label: 'QR Link' },
    { type: 'YOUTUBE', icon: <Youtube />, label: 'YouTube' },
    { type: 'SLIDES', icon: <Presentation />, label: 'Slides' },
    { type: 'PDF', icon: <FileText />, label: 'PDF' },
    { type: 'WEBSITE', icon: <Globe />, label: 'Website' },
    { type: 'MAGIC_ART', icon: <Sparkles />, label: 'Magic' },
    { type: 'NOTEPAD', icon: <StickyNote />, label: 'Notes', special: true },
  ];

  return (
    // The container handling the hover/slide effect is now in App.tsx to ensure hitbox works nicely.
    // This component purely renders the list.
    <div className="flex flex-col gap-2 p-2">
      {tools.map((tool) => {
        const isActive = tool.type === 'NOTEPAD' ? isNotepadOpen : activeWidget === tool.type;
        
        return (
          <button
            key={tool.type}
            onClick={() => onSelect(tool.type as WidgetType)}
            className={`group/btn relative p-3 rounded-xl transition-all duration-200 flex items-center gap-3 w-full
              ${isActive 
                ? 'bg-blue-100 text-blue-600 shadow-inner border-2 border-blue-200' 
                : 'hover:bg-gray-100 text-gray-500 hover:pl-4'}`}
          >
            <div className={`w-6 h-6 shrink-0 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
              {tool.icon}
            </div>
            
            <span className={`text-sm font-bold font-child uppercase tracking-wide whitespace-nowrap transition-colors
                ${isActive ? 'text-blue-800' : 'text-gray-600'}`}>
              {tool.label}
            </span>
            
            {/* Indicator dot for Notepad */}
            {tool.type === 'NOTEPAD' && isNotepadOpen && !isActive && (
               <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </button>
        );
      })}
    </div>
  );
};