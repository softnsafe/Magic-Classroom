import React from 'react';
import { Megaphone, ThumbsUp, ThumbsDown, Star, Drum, XCircle, Volume2 } from 'lucide-react';

interface Sound {
  id: string;
  label: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  textColor: string;
}

export const SoundboardWidget: React.FC = () => {
  const sounds: Sound[] = [
    { 
      id: 'airhorn', 
      label: 'Air Horn', 
      icon: <Megaphone size={40} />, 
      url: 'https://assets.mixkit.co/sfx/preview/mixkit-air-horn-777.mp3', 
      color: 'bg-red-500 hover:bg-red-400',
      textColor: 'text-white'
    },
    { 
      id: 'applause', 
      label: 'Applause', 
      icon: <ThumbsUp size={40} />, 
      url: 'https://assets.mixkit.co/sfx/preview/mixkit-audience-applause-heavy-518.mp3', 
      color: 'bg-green-500 hover:bg-green-400',
      textColor: 'text-white'
    },
    { 
      id: 'correct', 
      label: 'Correct', 
      icon: <Star size={40} />, 
      url: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-reward-952.mp3', 
      color: 'bg-yellow-400 hover:bg-yellow-300',
      textColor: 'text-yellow-900'
    },
    { 
      id: 'wrong', 
      label: 'Wrong', 
      icon: <XCircle size={40} />, 
      url: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3', 
      color: 'bg-gray-800 hover:bg-gray-700',
      textColor: 'text-white'
    },
    { 
      id: 'boo', 
      label: 'Boo / Fail', 
      icon: <ThumbsDown size={40} />, 
      url: 'https://assets.mixkit.co/sfx/preview/mixkit-cartoon-failure-piano-473.mp3', 
      color: 'bg-orange-500 hover:bg-orange-400',
      textColor: 'text-white'
    },
    { 
      id: 'drum', 
      label: 'Drum Roll', 
      icon: <Drum size={40} />, 
      url: 'https://assets.mixkit.co/sfx/preview/mixkit-drum-roll-566.mp3', 
      color: 'bg-blue-500 hover:bg-blue-400',
      textColor: 'text-white'
    },
  ];

  const playSound = (sound: Sound) => {
    const audio = new Audio(sound.url);
    audio.volume = 0.7;
    audio.play().catch(e => console.error("Error playing sound:", e));
    
    // Add simple animation class trigger if needed, but active state handles most of it
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="bg-gray-200 p-8 rounded-3xl shadow-inner border-4 border-gray-300 max-w-4xl w-full">
         <div className="flex items-center justify-center gap-3 mb-8 text-gray-400">
             <Volume2 size={32} />
             <h2 className="font-chalk text-4xl text-gray-500 tracking-widest">Sound FX</h2>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {sounds.map((sound) => (
              <button
                key={sound.id}
                onClick={() => playSound(sound)}
                className={`${sound.color} ${sound.textColor} p-6 rounded-2xl shadow-[0_8px_0_rgb(0,0,0,0.2)] hover:shadow-[0_4px_0_rgb(0,0,0,0.2)] hover:translate-y-[4px] active:shadow-none active:translate-y-[8px] transition-all duration-100 flex flex-col items-center gap-3 group`}
              >
                <div className="transform group-hover:scale-110 transition-transform duration-200">
                   {sound.icon}
                </div>
                <span className="font-chalk text-xl uppercase tracking-wider">{sound.label}</span>
              </button>
            ))}
         </div>
      </div>
    </div>
  );
};