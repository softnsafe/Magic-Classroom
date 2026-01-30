import React, { useState, useRef, useEffect } from 'react';
import { X, Trash2, UserPlus, Volume2 } from 'lucide-react';

export const WheelWidget: React.FC = () => {
  const [names, setNames] = useState(['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank']);
  const [newName, setNewName] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#F1948A'];

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 1.1; // Slightly cheerful pitch
        utterance.rate = 0.9;  // Clear speed
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
    }
  };

  const spin = () => {
    if (spinning || names.length === 0) return;
    setWinner(null);
    setSpinning(true);
    
    // Spin logic
    // Total rotation = current rotation + (min_spins * 360) + random_offset
    const extraSpins = 5;
    const randomOffset = Math.floor(Math.random() * 360);
    const newRotation = rotation + (360 * extraSpins) + randomOffset;
    
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      // Determine winner
      const normalizedRotation = newRotation % 360;
      const anglePerSegment = 360 / names.length;
      // Winning angle calculation based on 0 deg being top
      const winningAngle = (360 - normalizedRotation) % 360;
      const winningIndex = Math.floor(winningAngle / anglePerSegment);
      
      const winningName = names[winningIndex];
      setWinner(winningName);
      speak(`The winner is ${winningName}!`);
    }, 3000); // Match CSS transition duration
  };

  const addName = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      setNames([...names, newName.trim()]);
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
    <div className="flex flex-col items-center h-full justify-center gap-4 relative py-4">
      {winner && !spinning && (
         <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white p-8 rounded-3xl shadow-2xl animate-in zoom-in duration-500 border-8 border-yellow-400 transform rotate-2 pointer-events-auto flex flex-col items-center">
               <h2 className="font-chalk text-4xl text-center text-gray-800">Winner!</h2>
               
               <div className="flex items-center gap-2 mt-4">
                 <p className="font-child text-6xl text-purple-600 font-bold drop-shadow-sm text-center">{winner}</p>
                 <button 
                   onClick={() => speak(winner || '')}
                   className="p-2 bg-purple-100 rounded-full text-purple-600 hover:bg-purple-200 transition-colors"
                   title="Read aloud"
                 >
                   <Volume2 size={24} />
                 </button>
               </div>

               <button 
                onClick={() => setWinner(null)}
                className="mt-6 w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 rounded-xl font-child"
               >
                 Yay!
               </button>
            </div>
         </div>
      )}

      {/* Main Wheel Area */}
      <div className="relative shrink-0 mb-4">
        {/* Pointer */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 drop-shadow-md">
           <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-600"></div>
        </div>
        
        {/* Wheel SVG */}
        <div 
          className="w-[280px] h-[280px] md:w-[350px] md:h-[350px] lg:w-[400px] lg:h-[400px] rounded-full border-8 border-white shadow-2xl bg-white transition-transform duration-[3000ms] cubic-bezier(0.1, 0, 0.2, 1)"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
             {names.length > 0 ? names.map((name, i) => {
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

               return (
                 <g key={i}>
                   <path d={pathData} fill={colors[i % colors.length]} stroke="white" strokeWidth="0.01" />
                 </g>
               );
             }) : (
                <circle cx="0" cy="0" r="1" fill="#e5e7eb" />
             )}
          </svg>
          
          {/* Text Layer */}
          <div className="absolute inset-0 w-full h-full rounded-full pointer-events-none">
             {names.map((name, i) => {
                const angle = 360 / names.length;
                const rotate = i * angle + (angle / 2);
                return (
                  <div 
                    key={i}
                    className="absolute top-0 left-1/2 h-1/2 flex justify-center pt-8 md:pt-10 origin-bottom -translate-x-1/2"
                    style={{ transform: `rotate(${rotate}deg)` }}
                  >
                    <span className="text-white font-chalk font-bold text-lg md:text-xl drop-shadow-md truncate max-w-[100px] md:max-w-[140px] vertical-rl">
                      {name}
                    </span>
                  </div>
                );
             })}
             {names.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-chalk text-gray-400 text-2xl rotate-90">Empty</span>
                </div>
             )}
          </div>
        </div>
      </div>

      <button 
        onClick={spin}
        disabled={spinning || names.length === 0}
        className="px-12 py-4 bg-white text-3xl font-chalk rounded-full hover:bg-yellow-300 transition-colors shadow-[0_8px_0_rgb(0,0,0,0.1)] active:shadow-none active:translate-y-[8px] text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed mb-2 z-10"
      >
        {spinning ? 'Spinning...' : 'SPIN IT!'}
      </button>
      
      {/* Expanded Participant List */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl w-full max-w-2xl border-4 border-gray-200 flex flex-col gap-3 min-h-0 shrink-0">
        <div className="flex items-center justify-between border-b-2 border-gray-100 pb-2">
            <h3 className="font-chalk text-gray-500 text-xl">Participants ({names.length})</h3>
            {names.length > 0 && (
                <button 
                    onClick={() => setNames([])} 
                    className="text-red-400 hover:text-red-600 text-sm font-bold flex items-center gap-1 hover:underline font-child"
                >
                    <Trash2 size={14} /> Clear All
                </button>
            )}
        </div>

        {/* Input */}
        <form onSubmit={addName} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <UserPlus size={20} />
            </div>
            <input 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Type a name and press Enter..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-yellow-400 focus:outline-none font-child text-lg transition-all"
            />
          </div>
          <button 
            type="submit" 
            className="bg-green-500 text-white px-6 py-2 rounded-xl font-bold font-child hover:bg-green-600 active:scale-95 transition-all shadow-md"
          >
            Add
          </button>
        </form>

        {/* List Chips */}
        <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto custom-scrollbar p-1">
           {names.length === 0 && (
             <div className="w-full text-center py-6 text-gray-400 italic font-child text-lg bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                No participants yet. Add some names above!
             </div>
           )}
           {names.map((n, i) => (
             <div 
                key={`${n}-${i}`} 
                className="group bg-blue-50 border-2 border-blue-100 hover:border-blue-300 px-3 py-1.5 rounded-lg flex items-center gap-2 text-blue-900 font-child text-lg font-semibold animate-in zoom-in duration-200"
             >
               <span>{n}</span>
               <button 
                onClick={() => setNames(names.filter((_, idx) => idx !== i))} 
                className="w-6 h-6 flex items-center justify-center rounded-md text-blue-300 hover:bg-red-100 hover:text-red-500 transition-colors"
                title="Remove"
               >
                 <X size={16} />
               </button>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};