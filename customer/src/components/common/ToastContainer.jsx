import React from 'react';
import { useToastStore } from '../../store/useToastStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-forest-900 text-cream-50 border-gold-500/30';
        let Icon = CheckCircle2;
        let iconColor = 'text-gold-400';

        if (toast.type === 'error') {
          bgColor = 'bg-red-900 text-white border-red-700';
          Icon = AlertCircle;
          iconColor = 'text-red-300';
        } else if (toast.type === 'info') {
          bgColor = 'bg-charcoal-900 text-white border-charcoal-700';
          Icon = Info;
          iconColor = 'text-gold-300';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl ${bgColor} animate-in fade-in slide-in-from-bottom-3 duration-200`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <p className="text-xs font-medium flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-cream-400 hover:text-white flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
