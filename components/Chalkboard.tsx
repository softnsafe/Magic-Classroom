import React from 'react';

interface ChalkboardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Chalkboard: React.FC<ChalkboardProps> = ({ children, title, className = '' }) => {
  return (
    <div className={`relative bg-chalkboard border-[12px] border-amber-700 rounded-lg shadow-2xl p-6 ${className}`}>
      {/* Chalk dust effect */}
      <div className="absolute inset-0 pointer-events-none bg-white opacity-[0.03]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/dust.png")' }}></div>
      
      {title && (
        <h2 className="text-white font-chalk text-3xl md:text-5xl text-center mb-6 tracking-widest drop-shadow-md transform -rotate-1">
          {title}
        </h2>
      )}
      
      <div className="relative z-10 text-chalk-dust font-child flex-1 flex flex-col w-full h-full min-h-0">
        {children}
      </div>
    </div>
  );
};