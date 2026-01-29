import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarWidget: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex items-center justify-center h-full">
      {/* Paper Style Container */}
      <div className="bg-white p-6 rounded-lg shadow-2xl max-w-2xl w-full transform rotate-1 relative">
         {/* Tape */}
         <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-blue-400/80 -rotate-2 shadow-sm z-10"></div>

         {/* Header */}
         <div className="flex items-center justify-between mb-6 border-b-4 border-red-400 pb-4">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
            >
              <ChevronLeft size={32} />
            </button>
            
            <div className="text-center">
              <h2 className="text-4xl font-chalk text-gray-800 uppercase tracking-widest">
                {monthNames[currentDate.getMonth()]}
              </h2>
              <span className="text-gray-500 font-child text-xl font-bold">
                {currentDate.getFullYear()}
              </span>
            </div>

            <button 
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
            >
              <ChevronRight size={32} />
            </button>
         </div>

         {/* Days Header */}
         <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-chalk text-gray-500 font-bold">
                {day}
              </div>
            ))}
         </div>

         {/* Grid */}
         <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for previous month */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const active = isToday(day);
              return (
                <div 
                  key={day}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg font-child text-xl font-bold relative group cursor-default
                    ${active ? 'bg-red-500 text-white shadow-md transform scale-110' : 'hover:bg-gray-100 text-gray-700'}
                  `}
                >
                  {day}
                  {active && (
                    <span className="absolute -bottom-2 text-[10px] font-normal uppercase tracking-wide bg-yellow-200 text-yellow-800 px-1 rounded">Today</span>
                  )}
                </div>
              );
            })}
         </div>
      </div>
    </div>
  );
};