'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
          let border = 'border-emerald-500/20 bg-emerald-500/10 dark:bg-slate-900/80';
          if (toast.type === 'error') {
            icon = <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
            border = 'border-rose-500/20 bg-rose-500/10 dark:bg-slate-900/80';
          } else if (toast.type === 'info') {
            icon = <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
            border = 'border-blue-500/20 bg-blue-500/10 dark:bg-slate-900/80';
          }

          return (
            <div
              key={toast.id}
              className={`glass flex items-center justify-between p-4 rounded-2xl border ${border} shadow-lg pointer-events-auto transition-all duration-300 animate-in slide-in-from-right-5 text-xs font-medium text-slate-800 dark:text-slate-100`}
            >
              <div className="flex items-center space-x-3 mr-2">
                {icon}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
