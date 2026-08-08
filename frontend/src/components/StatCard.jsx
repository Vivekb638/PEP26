import React from 'react';

export function StatCard({ label, value, subtext, icon: Icon, color = 'blue' }) {
  const colorSchemes = {
    blue: {
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      glow: 'shadow-blue-500/5'
    },
    purple: {
      bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      glow: 'shadow-purple-500/5'
    },
    green: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      glow: 'shadow-emerald-500/5'
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      glow: 'shadow-amber-500/5'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div className={`bg-[#0d1324]/50 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 transition-all hover:border-slate-700/60 shadow-lg ${scheme.glow}`}>
      <div className={`p-3 rounded-xl border ${scheme.bg} shrink-0`}>
        {Icon && <Icon className="w-5 h-5" />}
      </div>
      <div className="space-y-1">
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">{label}</span>
        <h3 className="text-2xl font-black text-white leading-none">{value}</h3>
        {subtext && <p className="text-[10px] text-gray-500 font-medium">{subtext}</p>}
      </div>
    </div>
  );
}

export function ProgressCard({ title, progress, lessonsCount, activeLesson, onAction }) {
  return (
    <div className="bg-[#0d1324]/60 border border-slate-800 p-5 rounded-2xl transition-all hover:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex-1 w-full space-y-3">
        <div>
          <h4 className="font-extrabold text-base text-gray-100">{title}</h4>
          <span className="text-[11px] text-gray-400 font-semibold block mt-0.5">
            Active: <span className="text-slate-350">{activeLesson}</span> • {lessonsCount} lessons remaining
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-blue-400 uppercase tracking-wider">Progress</span>
            <span className="text-gray-300 font-mono">{progress}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
      <button
        onClick={onAction}
        className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-650/10 transition-all select-none border border-blue-500/20 active:scale-95"
      >
        Continue Learning
      </button>
    </div>
  );
}
