import React from 'react';
import { ToastMessage } from '@/types/flashcard';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-80 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-2xl border bg-white shadow-xl transition-all duration-300 animate-slideUp ${
              isSuccess
                ? 'border-emerald-200 text-emerald-950'
                : isError
                ? 'border-rose-200 text-rose-950'
                : 'border-indigo-200 text-indigo-950'
            }`}
          >
            <div className="flex items-start space-x-2.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {isError && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              {!isSuccess && !isError && <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />}
              <div>
                <p className="text-xs font-black">{toast.title}</p>
                {toast.message && <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{toast.message}</p>}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
