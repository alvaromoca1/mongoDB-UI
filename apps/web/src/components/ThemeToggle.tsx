import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
          className="appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          style={{
            backgroundColor: isDark ? 'rgba(44, 62, 80, 0.8)' : 'rgba(255, 255, 255, 0.1)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)',
            color: isDark ? '#ffffff' : '#1e293b'
          }}
        >
          <option value="light">☀️ Claro</option>
          <option value="dark">🌙 Oscuro</option>
          <option value="system">💻 Sistema</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Indicador visual del tema actual */}
      <div className="flex items-center space-x-1">
        {theme === 'light' && (
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" title="Tema claro" />
        )}
        {theme === 'dark' && (
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" title="Tema oscuro" />
        )}
        {theme === 'system' && (
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" title="Tema del sistema" />
        )}
      </div>
    </div>
  );
};
