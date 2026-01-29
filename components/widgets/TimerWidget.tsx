import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const TimerWidget: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(300);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
       <div className="text-[120px] md:text-[200px] font-chalk text-white leading-none tracking-widest tabular-nums drop-shadow-lg">
         {formatTime(timeLeft)}
       </div>
       
       <div className="flex items-center gap-4">
         <button 
           onClick={() => setIsRunning(!isRunning)}
           className="bg-green-500 hover:bg-green-600 text-white rounded-full p-6 shadow-lg transition-transform hover:scale-110"
         >
           {isRunning ? <Pause size={32} /> : <Play size={32} />}
         </button>
         
         <button 
           onClick={() => { setIsRunning(false); setTimeLeft(initialTime); }}
           className="bg-gray-500 hover:bg-gray-600 text-white rounded-full p-6 shadow-lg transition-transform hover:scale-110"
         >
           <RotateCcw size={32} />
         </button>
       </div>

       {/* Quick Select */}
       <div className="flex gap-2 mt-4">
          {[60, 300, 600, 900].map(sec => (
             <button 
               key={sec}
               onClick={() => { setInitialTime(sec); setTimeLeft(sec); setIsRunning(false); }}
               className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-child font-bold"
             >
               {sec / 60} min
             </button>
          ))}
       </div>
    </div>
  );
};
