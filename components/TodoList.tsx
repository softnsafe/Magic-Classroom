import React, { useState, useEffect } from 'react';
import { TodoItem } from '../types';
import { Plus, X, Star } from 'lucide-react';

export const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<TodoItem[]>([]);
  const [newTask, setNewTask] = useState('');
  const [now, setNow] = useState(new Date());

  // Update time every minute for the header
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('classroom-todo');
    if (saved) {
      try {
        const parsedTasks = JSON.parse(saved);
        setTasks(parsedTasks);
      } catch (e) {
        console.error("Failed to parse todos", e);
      }
    } else {
        // Default items if fresh
        setTasks([
            { id: '1', text: 'Take Attendance', completed: false, createdAt: Date.now() },
            { id: '2', text: 'Math Homework', completed: false, createdAt: Date.now() },
        ]);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('classroom-todo', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { 
      id: Date.now().toString(), 
      text: newTask.trim(), 
      completed: false,
      createdAt: Date.now() 
    }]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(t => !t.completed));
  }

  const dateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="bg-paper-yellow w-full h-full rounded-sm shadow-xl relative overflow-hidden flex flex-col transform rotate-1 border-t-8 border-yellow-600">
      {/* Holes */}
      <div className="absolute top-0 left-4 w-4 h-4 bg-gray-800 rounded-full mt-2 opacity-80 shadow-inner"></div>
      <div className="absolute top-0 right-4 w-4 h-4 bg-gray-800 rounded-full mt-2 opacity-80 shadow-inner"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-800 rounded-full mt-2 opacity-80 shadow-inner"></div>

      {/* Header */}
      <div className="pt-10 pb-2 px-6 border-b-2 border-red-300 flex flex-col gap-1">
        <div className="flex justify-between items-end">
            <h2 className="font-chalk text-3xl text-gray-800 leading-none">To-Do List</h2>
            {tasks.some(t => t.completed) && (
                <button onClick={clearCompleted} className="text-xs text-red-500 hover:underline font-child mb-1">
                    Clear Done
                </button>
            )}
        </div>
        <div className="text-gray-500 font-chalk text-sm opacity-80 pl-1">
            {dateString} • {timeString}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto notebook-lines p-6 space-y-3">
        {tasks.length === 0 && (
            <div className="text-center text-gray-400 font-child italic mt-10">
                Nothing to do! <br/> Great job!
            </div>
        )}
        {tasks.map(task => (
          <div key={task.id} className="flex items-start gap-3 group animate-in slide-in-from-left duration-300">
            <button 
              onClick={() => toggleTask(task.id)}
              className={`mt-1 w-8 h-8 shrink-0 rounded-full border-2 border-gray-300 flex items-center justify-center transition-all shadow-sm ${task.completed ? 'bg-yellow-400 border-yellow-500 scale-110 rotate-12' : 'bg-white hover:bg-gray-50'}`}
            >
              {task.completed && <Star size={18} className="text-white fill-white" />}
            </button>
            
            <span 
              className={`font-child text-xl flex-1 leading-snug break-words pt-1 ${task.completed ? 'line-through text-gray-400 decoration-2 decoration-yellow-400/50' : 'text-gray-800'}`}
            >
              {task.text}
            </span>

            <button 
              onClick={() => deleteTask(task.id)} 
              className="mt-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={addTask} className="p-4 bg-yellow-100 border-t border-yellow-300 flex gap-2">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task..." 
          className="flex-1 bg-white border-2 border-yellow-300 rounded-lg px-3 py-2 font-child focus:outline-none focus:border-yellow-500 transition-colors shadow-inner"
        />
        <button type="submit" className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 shadow-md active:translate-y-0.5 active:shadow-sm">
          <Plus size={24} />
        </button>
      </form>
    </div>
  );
};