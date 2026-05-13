// ✅ theme.tsx
import React from 'react';

interface ThemeProps {
  theme: 'light' | 'dark' | 'system'; // ✅ match your domain
  setTheme: (value: 'light' | 'dark' | 'system') => void; // ✅
}

const Theme: React.FC<ThemeProps> = ({ theme, setTheme }) => {
  return (
    <div className="px-6 mb-6 w-full">
      <label className="block flex justify-center text-sm font-semibold mb-2">
        Theme
      </label>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex-1 py-2 px-4 rounded-[4px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
            theme === 'light'
              ? 'bg-light from-blue-600 to-indigo-700 text-dark font-semibold shadow-md'
              : 'bg-dark border border-slate-300 text-light hover:bg-slate-700'
          }`}
        >
          Light
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex-1 py-2 px-4 rounded-[4px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
            theme === 'dark'
              ? 'bg-light from-blue-600 to-indigo-700 text-dark font-semibold shadow-md'
              : 'bg-dark border border-slate-300 text-light hover:bg-slate-700'
          }`}
        >
          Dark
        </button>
        <button
          type="button"
          // ✅ Use 'system', not 'auto'
          onClick={() => setTheme('system')}
          className={`flex-1 py-2 px-4 rounded-[4px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
            theme === 'system'
              ? 'bg-light from-blue-600 to-indigo-700 text-dark font-semibold shadow-md'
              : 'bg-dark border border-slate-300 text-light hover:bg-slate-700'
          }`}
        >
          System
        </button>
      </div>
    </div>
  );
};

export default Theme;