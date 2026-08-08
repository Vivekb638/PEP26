import React from 'react';
import { 
  BookOpen, 
  Home, 
  Target, 
  MessageSquare, 
  Award, 
  TrendingUp, 
  Settings, 
  LogOut, 
  UserCheck, 
  UserX,
  PlusSquare,
  Shield
} from 'lucide-react';

export function Sidebar({ activeRoute, setActiveRoute, user, onLogout }) {
  const mainNavigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'mylearning', label: 'My Learning', icon: Target },
    { id: 'quizzes', label: 'Quizzes', icon: Award },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'aitutor', label: 'AI Tutor', icon: MessageSquare }
  ];

  return (
    <aside className="w-64 bg-[#0d1324] border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      
      {/* Top Section */}
      <div className="flex flex-col gap-6 pt-6 px-4">
        {/* Branding */}
        <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={() => setActiveRoute('dashboard')}>
          <div className="bg-gradient-to-tr from-blue-600 to-purple-650 p-2 rounded-xl text-white shadow-md shadow-purple-500/10">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
              StudyStack
            </h1>
            <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase block mt-1">E-Learning & AI</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-gray-500 tracking-wider uppercase px-2 mb-2 block">Navigation</span>
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveRoute(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all select-none border relative ${
                  isActive 
                    ? 'bg-blue-600/10 border-blue-500/25 text-blue-400 font-bold' 
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                {/* Active left indicator line */}
                {isActive && (
                  <span className="absolute left-0 top-3 bottom-3 w-0.5 bg-blue-500 rounded-r"></span>
                )}
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}

          {/* Instructor Mode Tab (Visible only if instructor) */}
          {user && user.role === 'instructor' && (
            <>
              <span className="text-[9px] font-bold text-gray-500 tracking-wider uppercase px-2 mt-4 mb-2 block">Instructor Area</span>
              <button
                onClick={() => setActiveRoute('instructor')}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all select-none border relative ${
                  activeRoute === 'instructor' 
                    ? 'bg-purple-600/10 border-purple-500/25 text-purple-400 font-bold' 
                    : 'bg-transparent border-transparent text-purple-400/80 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                {activeRoute === 'instructor' && (
                  <span className="absolute left-0 top-3 bottom-3 w-0.5 bg-purple-500 rounded-r"></span>
                )}
                <Shield className="w-4 h-4" />
                Control Board
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-1 p-4 border-t border-slate-850">
        <button
          onClick={() => setActiveRoute('settings')}
          className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all select-none border relative ${
            activeRoute === 'settings' 
              ? 'bg-blue-600/10 border-blue-500/25 text-blue-400 font-bold' 
              : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl bg-transparent hover:bg-red-950/25 hover:text-red-400 text-gray-400 transition-all select-none"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

    </aside>
  );
}
