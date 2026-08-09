import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

const ICONS = {
  success: (
    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const STYLES = {
  success: 'bg-white border-emerald-200 shadow-emerald-100/50',
  error:   'bg-white border-red-200   shadow-red-100/50',
  warning: 'bg-white border-yellow-200 shadow-yellow-100/50',
  info:    'bg-white border-blue-200  shadow-blue-100/50',
};

const BAR = {
  success: 'bg-emerald-500',
  error:   'bg-red-500',
  warning: 'bg-yellow-500',
  info:    'bg-blue-500',
};

function Toast({ id, message, type, onClose }) {
  return (
    <div className={`relative flex items-start gap-3 min-w-[280px] max-w-sm w-full px-4 py-3.5 rounded-xl border shadow-lg overflow-hidden animate-in ${STYLES[type]}`}>
      <div className={`absolute bottom-0 left-0 h-0.5 w-full ${BAR[type]} opacity-60`} />
      {ICONS[type]}
      <p className="text-sm font-medium text-gray-800 flex-1 leading-snug">{message}</p>
      <button onClick={() => onClose(id)} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 mt-0.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  const success = useCallback((msg, dur) => toast(msg, 'success', dur), [toast]);
  const error   = useCallback((msg, dur) => toast(msg, 'error',   dur), [toast]);
  const warning = useCallback((msg, dur) => toast(msg, 'warning', dur), [toast]);
  const info    = useCallback((msg, dur) => toast(msg, 'info',    dur), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
        {toasts.map(t => <Toast key={t.id} {...t} onClose={remove} />)}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
