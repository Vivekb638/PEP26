import React from 'react';
import { User, ChevronRight, Edit, Trash2, Tag, BookOpen } from 'lucide-react';

export function CourseCard({ 
  course, 
  user, 
  isEnrolled = false, 
  progress = 0, 
  onViewDetails, 
  onEnroll, 
  onEdit, 
  onDelete 
}) {
  // Extract custom tags based on title name
  const getTags = (title) => {
    const t = title.toLowerCase();
    if (t.includes('java')) return { name: 'Java', color: 'text-orange-400 bg-orange-400/10 border-orange-400/25' };
    if (t.includes('node') || t.includes('express')) return { name: 'Node.js', color: 'text-green-400 bg-green-400/10 border-green-400/25' };
    if (t.includes('genai') || t.includes('rag') || t.includes('assistant') || t.includes('ai')) return { name: 'Generative AI', color: 'text-purple-400 bg-purple-400/10 border-purple-400/25' };
    if (t.includes('react')) return { name: 'React', color: 'text-blue-400 bg-blue-400/10 border-blue-400/25' };
    return { name: 'Backend', color: 'text-slate-400 bg-slate-450/10 border-slate-400/25' };
  };

  const tag = getTags(course.title);

  return (
    <div className="group relative bg-[#0d1324]/50 border border-slate-800 hover:border-slate-700/60 p-5 rounded-2xl flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 overflow-hidden">
      
      {/* Absolute Glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-full blur-2xl group-hover:scale-150 transition-all pointer-events-none"></div>

      <div className="space-y-3">
        {/* Top Tag & Price */}
        <div className="flex justify-between items-center">
          <span className={`text-[10px] font-bold px-2 py-0.5 border rounded ${tag.color}`}>
            {tag.name}
          </span>
          <span className="text-sm font-extrabold text-blue-400 font-mono">
            ${course.price}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-base text-gray-100 group-hover:text-blue-400 transition-colors leading-snug line-clamp-1">
          {course.title}
        </h3>
        
        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {course.description || 'Access comprehensive structured materials, interactive developer guides, and an AI co-pilot.'}
        </p>

        {/* Enrolled Progress Bar */}
        {isEnrolled && (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[9px] font-bold">
              <span className="text-gray-400">ENROLLED</span>
              <span className="text-blue-400 font-mono">{progress}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-350"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="border-t border-slate-850 pt-3.5 mt-4 flex items-center justify-between">
        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5 truncate max-w-[50%]">
          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">By <span className="text-slate-300 font-semibold">{course.instructor}</span></span>
        </span>

        <div className="flex items-center gap-1.5">
          {user && user.role === 'instructor' && onEdit && onDelete && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(course); }}
                className="p-1.5 bg-slate-850 hover:bg-slate-800 text-gray-300 rounded-lg border border-slate-750"
                title="Edit Course"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(course._id); }}
                className="p-1.5 bg-red-950/40 hover:bg-red-900/30 border border-red-500/20 text-red-400 rounded-lg"
                title="Delete Course"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {user && !isEnrolled && onEnroll && user.role !== 'instructor' && (
            <button
              onClick={(e) => { e.stopPropagation(); onEnroll(course._id); }}
              className="text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-500/20 px-2.5 py-1.5 rounded-lg transition-all"
            >
              Enroll
            </button>
          )}

          <button
            onClick={() => onViewDetails(course)}
            className="text-[11px] font-bold text-gray-400 hover:text-white hover:underline flex items-center gap-0.5 pl-1.5"
          >
            Details
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
}
