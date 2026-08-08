import React, { useState } from 'react';
import { Search, Bell, Sparkles, User, ChevronDown } from 'lucide-react';

export function Navbar({ user, activeRoute, setActiveRoute, searchQuery, onSearchChange }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const notifications = [
    { id: 1, text: "Syllabus updated: Added PDF vector store details", time: "2 hours ago" },
    { id: 2, text: "Instructor added 'Adv Node.js Rest APIs' course", time: "1 day ago" }
  ];

  return (
    <header className="bg-[#0b0f19] border-b border-slate-850 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shrink-0">
      
      {/* Left: Dynamic Greetings or Search */}
      <div className="flex items-center gap-4 flex-1">
        {activeRoute === 'courses' ? (
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search catalog courses..."
              value={searchQuery}
              onChange={onSearchChange}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/40 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-gray-200 placeholder-slate-550 transition-colors"
            />
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-extrabold text-white leading-none">
              {getGreeting()}, {user?.name || 'Vineet'} 👋
            </h2>
            <span className="text-[10px] text-gray-500 font-bold block mt-1 tracking-wide">
              {activeRoute === 'dashboard' ? 'Continue your learning journey' : `System Area • ${activeRoute}`}
            </span>
          </div>
        )}
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-4 shrink-0">
        
        {/* Notifications Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-slate-900/40 border border-transparent hover:border-slate-800 transition-all relative"
            title="System Updates"
          >
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-550 rounded-full animate-pulse"></span>
            <Bell className="w-4 h-4" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-72 bg-[#0d1324] border border-slate-800 rounded-2xl p-4 shadow-xl shadow-black/40 z-30 animate-fadeIn space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">System Notifications</span>
                <button onClick={() => setShowNotifications(false)} className="text-[10px] font-bold text-blue-400 hover:underline">Dismiss</button>
              </div>
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div key={n.id} className="text-[11px] leading-relaxed text-gray-300">
                    <p className="font-medium">{n.text}</p>
                    <span className="text-[9px] text-gray-500 block mt-0.5">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div 
          onClick={() => setActiveRoute('profile')}
          className="flex items-center gap-2 bg-[#0d1324] border border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer hover:border-slate-700 transition-colors select-none"
        >
          <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 p-1 rounded-lg text-white">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-gray-350">{user?.name || 'Vineet'}</span>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </div>

      </div>

    </header>
  );
}
