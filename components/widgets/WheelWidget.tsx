import React, { useState, useRef, useEffect } from 'react';

export const WheelWidget: React.FC = () => {
  const [names, setNames] = useState(['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank']);
  const [newName, setNewName] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F1948A'];

  const spin = () => {
    if (spinning || names.length === 0) return;
    setWinner(null);
    setSpinning(true);
    
    // Spin logic
    // We want to land on a random angle.
    // Total rotation = current rotation + (min_spins * 360) + random_offset
    const extraSpins = 5;
    const randomOffset = Math.floor(Math.random() * 360);
    const newRotation = rotation + (360 * extraSpins) + randomOffset;
    
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      // Determine winner
      // The pointer is at the TOP (270 degrees in SVG coordinate space if 0 is right, but we rotated the whole SVG -90deg so 0 is top).
      // Actually, let's keep it simple: Pointer is at top.
      // If we rotate the wheel clockwise by R degrees, the segment at the top is determined by:
      // (360 - (R % 360)) % 360.
      const normalizedRotation = newRotation % 360;
      const anglePerSegment = 360 / names.length;
      // We need to adjust because SVG paths start at 3 o'clock usually, 
      // but let's assume we render 0 deg at top.
      // If 0 is top, and we rotate R deg. The top pointer hits the angle (360 - R % 360).
      const winningAngle = (360 - normalizedRotation) % 360;
      const winningIndex = Math.floor(winningAngle / anglePerSegment);
      
      setWinner(names[winningIndex]);
    }, 3000); // Match CSS transition duration
  };

  const addName = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      setNames([...names, newName]);
      setNewName('');
    }
  };

  // SVG Helper functions
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="flex flex-col items-center h-full justify-center gap-6 relative">
      {winner && !spinning && (
         <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white p-8 rounded-3xl shadow-2xl animate-in zoom-in duration-500 border-8 border-yellow-400 transform rotate-2">
               <h2 className="font-chalk text-4xl text-center text-gray-800">Winner!</h2>
               <p className="font-child text-6xl text-purple-600 font-bold mt-4 drop-shadow-sm">{winner}</p>
            </div>
         </div>
      )}

      <div className="relative">
        {/* Pointer */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 drop-shadow-md">
           <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[50px] border-t-red-600"></div>
        </div>
        
        {/* Wheel SVG */}
        <div 
          className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full border-8 border-white shadow-2xl bg-white transition-transform duration-[3000ms] cubic-bezier(0.1, 0, 0.2, 1)"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
             {names.map((name, i) => {
               const startPercent = i / names.length;
               const endPercent = (i + 1) / names.length;
               const [startX, startY] = getCoordinatesForPercent(startPercent);
               const [endX, endY] = getCoordinatesForPercent(endPercent);
               const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;
               
               // Path for slice
               const pathData = [
                 `M 0 0`,
                 `L ${startX} ${startY}`,
                 `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                 `Z`
               ].join(' ');

               // Calculate text rotation
               // Midpoint angle in degrees
               const midAngle = (startPercent + endPercent) / 2 * 360;
               
               return (
                 <g key={i}>
                   <path d={pathData} fill={colors[i % colors.length]} stroke="white" strokeWidth="0.01" />
                 </g>
               );
             })}
          </svg>
          
          {/* Text Layer (Overlay HTML for easier text styling than SVG text) */}
          <div className="absolute inset-0 w-full h-full rounded-full pointer-events-none">
             {names.map((name, i) => {
                const angle = 360 / names.length;
                const rotate = i * angle + (angle / 2);
                return (
                  <div 
                    key={i}
                    className="absolute top-0 left-1/2 h-1/2 flex justify-center pt-8 md:pt-12 origin-bottom -translate-x-1/2"
                    style={{ transform: `rotate(${rotate}deg)` }}
                  >
                    <span className="text-white font-chalk font-bold text-lg md:text-2xl drop-shadow-md truncate max-w-[120px] vertical-rl">
                      {name}
                    </span>
                  </div>
                );
             })}
          </div>
        </div>
      </div>

      <button 
        onClick={spin}
        disabled={spinning || names.length === 0}
        className="px-8 py-3 bg-white text-2xl font-chalk rounded-full hover:bg-yellow-100 transition-colors shadow-lg active:scale-95 text-gray-800 disabled:opacity-50"
      >
        {spinning ? 'Spinning...' : 'SPIN IT!'}
      </button>
      
      <div className="bg-black/20 p-2 rounded-xl backdrop-blur-sm w-full max-w-sm">
        <form onSubmit={addName} className="flex gap-2 mb-2">
          <input 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Add name..."
            className="flex-1 px-3 py-2 rounded-lg bg-white/90 font-child focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors">+</button>
        </form>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/50">
           {names.length === 0 && <span className="text-white/70 italic text-sm">Add names to spin!</span>}
           {names.map((n, i) => (
             <div key={i} className="bg-white/90 px-2 py-1 rounded-md flex items-center gap-1 text-sm font-child whitespace-nowrap">
               {n}
               <button onClick={() => setNames(names.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 ml-1">×</button>
             </div>
           ))}
           {names.length > 0 && (
             <button onClick={() => setNames([])} className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold hover:bg-red-600 whitespace-nowrap">
               Clear All
             </button>
           )}
        </div>
      </div>
    </div>
  );
};
