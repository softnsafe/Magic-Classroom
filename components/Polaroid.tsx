import React from 'react';

interface PolaroidProps {
  imageSrc: string | null;
  label: string;
  color?: string; // Tailwind color class for the tape
  rotation?: string; // Tailwind rotate class
  placeholderIcon?: React.ReactNode;
}

export const Polaroid: React.FC<PolaroidProps> = ({ 
  imageSrc, 
  label, 
  color = 'bg-red-400', 
  rotation = 'rotate-2',
  placeholderIcon 
}) => {
  return (
    <div className={`relative bg-white p-4 pb-12 shadow-lg transition-transform hover:scale-105 duration-300 transform ${rotation} max-w-sm mx-auto w-full`}>
      {/* Tape */}
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 ${color} opacity-80 shadow-sm rotate-1 z-10`}></div>
      
      {/* Image Area */}
      <div className="bg-gray-100 aspect-square w-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
        {imageSrc ? (
          <img src={imageSrc} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-400 flex flex-col items-center gap-2 p-4 text-center">
            {placeholderIcon}
            <span className="font-child font-bold text-lg text-gray-400/50">Empty</span>
          </div>
        )}
      </div>
      
      {/* Caption */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <p className="font-chalk text-xl text-gray-800">{label}</p>
      </div>
    </div>
  );
};
