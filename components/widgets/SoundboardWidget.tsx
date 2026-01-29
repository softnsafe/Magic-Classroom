import React, { useState, useRef, useEffect } from 'react';
import { Megaphone, ThumbsUp, ThumbsDown, Star, Drum, XCircle, Volume2, Square, StopCircle } from 'lucide-react';

interface Sound {
  id: string;
  label: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  textColor: string;
}

export const SoundboardWidget: React.FC = () => {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Using raw.githubusercontent.com avoids 302 redirects which can sometimes block audio in strict environments
  const sounds: Sound[] = [
    { 
      id: 'airhorn', 
      label: 'Air Horn', 
      icon: <Megaphone size={40} />, 
      url: 'https://raw.githubusercontent.com/mowglin/soundboard/master/sounds/airhorn.mp3', 
      color: 'bg-red-500 hover:bg-red-400',
      textColor: 'text-white'
    },
    { 
      id: 'applause', 
      label: 'Applause', 
      icon: <ThumbsUp size={40} />, 
      url: 'https://raw.githubusercontent.com/mowglin/soundboard/master/sounds/applause.mp3', 
      color: 'bg-green-500 hover:bg-green-400',
      textColor: 'text-white'
    },
    { 
      id: 'correct', 
      label: 'Correct', 
      icon: <Star size={40} />, 
      url: 'https://raw.githubusercontent.com/mowglin/soundboard/master/sounds/coin.mp3', 
      color: 'bg-yellow-400 hover:bg-yellow-300',
      textColor: 'text-yellow-900'
    },
    { 
      id: 'wrong', 
      label: 'Wrong', 
      icon: <XCircle size={40} />, 
      url: 'https://raw.githubusercontent.com/mowglin/soundboard/master/sounds/sad_trombone.mp3', 
      color: 'bg-gray-800 hover:bg-gray-700',
      textColor: 'text-white'
    },
    { 
      id: 'boo', 
      label: 'Boo', 
      icon: <ThumbsDown size={40} />, 
      url: 'https://raw.githubusercontent.com/mowglin/soundboard/master/sounds/boo.mp3', 
      color: 'bg-orange-500 hover:bg-orange-400',
      textColor: 'text-white'
    },
    { 
      id: 'drum', 
      label: 'Drum Roll', 
      icon: <Drum size={40} />, 
      url: 'https://raw.githubusercontent.com/mowglin/soundboard/master/sounds/badumtss.mp3', 
      color: 'bg-blue-500 hover:bg-blue-400',
      textColor: 'text-white'
    },
  ];

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };
  }, []);

  const stopSound = () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
      }
      setActiveSoundId(null);
  };

  const toggleSound = (sound: Sound) => {
    if (activeSoundId === sound.id) {
        stopSound();
        return;
    }

    stopSound();
    
    const audio = new Audio(sound.url);
    audio.loop = true;
    audio.volume = 0.8;
    
    audio.onerror = (e) => {
      console.error("Error playing sound:", e);
      stopSound();
      alert("Oops! This sound couldn't be loaded.");
    };

    audio.play().catch(e => {
        console.error("Playback failed:", e);
        stopSound();
    });
    
    audioRef.current = audio;
    setActiveSoundId(sound.id);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="bg-gray-200 p-8 rounded-3xl shadow-inner border-4 border-gray-300 max-w-4xl w-full relative">
         <div className="flex items-center justify-center gap-3 mb-8 text-gray-400">
             <Volume2 size={32} />
             <h2 className="font-chalk text-4xl text-gray-500 tracking-widest">Sound FX</h2>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {sounds.map((sound) => {
              const isActive = activeSoundId === sound.id;
              return (
                <button
                  key={sound.id}
                  onClick={() => toggleSound(sound)}
                  className={`${sound.color} ${sound.textColor} p-6 rounded-2xl transition-all duration-100 flex flex-col items-center gap-3 group relative overflow-hidden
                    ${isActive ? 'scale-95 shadow-none translate-y-[8px] ring-4 ring-white/50' : 'shadow-[0_8px_0_rgb(0,0,0,0.2)] hover:shadow-[0_4px_0_rgb(0,0,0,0.2)] hover:translate-y-[4px]'}
                  `}
                >
                  <div className={`transform transition-transform duration-200 ${isActive ? 'scale-125 animate-bounce' : 'group-hover:scale-110'}`}>
                     {isActive ? <Square size={40} fill="currentColor" /> : sound.icon}
                  </div>
                  <span className="font-chalk text-xl uppercase tracking-wider">
                      {isActive ? 'STOP' : sound.label}
                  </span>
                  
                  {isActive && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-2xl" />
                  )}
                </button>
              );
            })}
         </div>
         
         <div className="mt-8 flex flex-col items-center gap-2 min-h-[80px] justify-end">
            {activeSoundId ? (
                <button 
                    onClick={stopSound}
                    className="bg-red-600 text-white px-10 py-4 rounded-full font-chalk text-2xl shadow-xl hover:bg-red-700 hover:scale-105 transition-all flex items-center gap-3 animate-in slide-in-from-bottom-2 border-4 border-red-800"
                >
                    <StopCircle size={32} />
                    STOP SOUND
                </button>
            ) : (
                <div className="text-center text-gray-400 font-child text-lg opacity-60">
                    Tap a button to start looping a sound.
                </div>
            )}
         </div>
      </div>
    </div>
  );
};