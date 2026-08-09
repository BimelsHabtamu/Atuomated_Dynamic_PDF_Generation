import { useEffect, useRef, useState } from 'react';

export default function Dropdown({ trigger, children, align = 'right', width = 'w-52' }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)} className="cursor-pointer">
        {typeof trigger === 'function' ? trigger(open) : trigger}
      </div>
      {open && (
        <div
          className={`absolute ${alignClass} top-full mt-2 ${width} bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 py-1.5 z-50 animate-in`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ icon, label, onClick, danger, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors
        ${danger
          ? 'text-red-500 hover:bg-red-50'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      {label}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-gray-100" />;
}

export function DropdownLabel({ children }) {
  return (
    <div className="px-4 py-2">
      {children}
    </div>
  );
}
