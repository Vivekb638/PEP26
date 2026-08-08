import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Reusable Button Component
export function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '',
  icon: Icon
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all active:scale-[0.98] select-none';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/10 border border-blue-500/25',
    secondary: 'bg-slate-900/60 hover:bg-slate-800/60 text-slate-200 border border-slate-800',
    purple: 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/10 border border-purple-500/25',
    danger: 'bg-red-950/40 hover:bg-red-900/30 text-red-300 border border-red-500/20'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-3 text-base'
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed active:scale-100';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? disabledStyles : ''} ${className}`}
    >
      {disabled && variant !== 'danger' ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-1.5" />
      ) : null}
      {children}
    </button>
  );
}

// Reusable Modal Component
export function Modal({ isOpen, onClose, title, description, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0d1324] border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 animate-scaleUp">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-extrabold text-lg text-white">{title}</h3>
            {description && <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg font-bold"
          >
            &times;
          </button>
        </div>
        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}

// Reusable Loading Spinner
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <RefreshCw className={`${sizes[size]} animate-spin text-blue-500`} />
    </div>
  );
}

// Reusable Empty State Display
export function EmptyState({ title, description, actionText, onAction, icon: Icon = AlertCircle }) {
  return (
    <div className="bg-[#0d1324]/30 border border-slate-800/80 rounded-3xl p-12 text-center max-w-lg mx-auto animate-fadeIn">
      <Icon className="w-10 h-10 text-slate-650 mx-auto mb-3.5" />
      <h4 className="font-extrabold text-base text-gray-200">{title}</h4>
      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} className="mt-5 text-xs px-5 py-2.5 font-bold shadow-md">
          {actionText}
        </Button>
      )}
    </div>
  );
}
