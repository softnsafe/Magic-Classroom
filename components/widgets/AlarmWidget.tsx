import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, Clock } from 'lucide-react';

export const AlarmWidget: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmTime, setAlarmTime] = useState('');
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  
  // Ref for the alarm audio
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    // Using MyInstants for the rooster sound - generally reliable for playback
    audioRef.current = new Audio('https://www.myinstants.com/media/sounds/rooster.mp3');
    audioRef.current.loop = true;
    // Removed crossOrigin to prevent potential CORS blocks on opaque playback
    
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };
  }, []);

  // Update current time and check alarm
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check alarm
      if (isAlarmActive && !isRinging) {
        const currentHours = now.getHours().toString().padStart(2, '0');
        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
        const currentTimeString = `${currentHours}:${currentMinutes}`;
        
        // Check if seconds are 00 to avoid multiple triggers within the same minute
        if (currentTimeString === alarmTime && now.getSeconds() === 0) {
          triggerAlarm();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [alarmTime, isAlarmActive, isRinging]);

  const triggerAlarm = () => {
      setIsRinging(true);
      if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.error("Alarm play failed", e));
      }
  };

  const stopAlarm = () => {
      setIsRinging(false);
      setIsAlarmActive(false);
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
  };

  const toggleAlarmState = () => {
    if (isRinging) {
      stopAlarm();
    } else {
      setIsAlarmActive(!isAlarmActive);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center h-full transition-all duration-300 ${isRinging ? 'animate-bounce' : ''}`}>
      {/* Clock Display */}
      <div className={`bg-gray-900 border-8 ${isRinging ? 'border-red-500 shadow-red-500/50' : 'border-gray-700'} rounded-3xl p-8 shadow-2xl relative mb-8 transition-colors duration-500`}>
        {isRinging && (
           <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-red-500 animate-pulse">
              <Bell size={48} className="animate-wiggle" />
           </div>
        )}
        
        <div className={`text-6xl md:text-8xl font-mono tracking-widest ${isRinging ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl flex flex-col items-center gap-4 border-2 border-white/20">
        <div className="flex items-center gap-4">
          <label className="text-white font-chalk text-xl">Set Alarm:</label>
          <input 
            type="time" 
            value={alarmTime}
            onChange={(e) => {
              setAlarmTime(e.target.value);
              setIsAlarmActive(true); 
              setIsRinging(false);
              if (audioRef.current) audioRef.current.pause();
            }}
            className="bg-white/80 text-gray-900 font-child text-2xl rounded-lg px-4 py-2 focus:outline-none focus:ring-4 focus:ring-blue-400"
          />
        </div>

        <button
          onClick={toggleAlarmState}
          className={`flex items-center gap-2 px-8 py-3 rounded-full text-xl font-bold font-child transition-all transform active:scale-95 shadow-lg
            ${isRinging 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : isAlarmActive 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-400 hover:bg-gray-500 text-white'}`}
        >
          {isRinging ? (
            <>
              <BellOff /> Stop Alarm
            </>
          ) : isAlarmActive ? (
            <>
              <Bell /> Alarm On
            </>
          ) : (
            <>
              <BellOff /> Alarm Off
            </>
          )}
        </button>
      </div>
      
      {isAlarmActive && !isRinging && (
        <p className="mt-4 text-white/50 font-child text-sm">
          Alarm set for {alarmTime}
        </p>
      )}
    </div>
  );
};