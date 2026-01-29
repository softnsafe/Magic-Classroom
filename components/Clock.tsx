import React, { useState, useEffect } from 'react';

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div className="flex flex-col items-end text-white opacity-90 font-chalk drop-shadow-md select-none">
      <div className="text-6xl md:text-8xl leading-none">
        {formatTime(time)}
      </div>
      <div className="text-xl md:text-3xl mt-2 text-yellow-200">
        {formatDate(time)}
      </div>
    </div>
  );
};
