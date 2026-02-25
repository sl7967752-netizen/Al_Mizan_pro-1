import React from 'react';
import { Moon } from 'lucide-react';
import { Language, Translation } from '../types';

interface HeaderProps {
  t: Translation;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ t, currentLang, onLangChange }) => {
  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ur', label: 'اردو' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <header className="bg-emerald-800 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          <Moon className="w-8 h-8 text-yellow-400 fill-yellow-400 flex-shrink-0" />
          <div className="text-center sm:text-left">
            <h1 className="text-xl md:text-2xl font-bold leading-tight">{t.title}</h1>
            <p className="text-emerald-200 text-xs md:text-sm hidden sm:block">{t.subtitle}</p>
          </div>
        </div>
        
        <nav className="flex items-center bg-emerald-900/50 p-1 rounded-lg border border-emerald-700 overflow-x-auto max-w-full" aria-label={t.language}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLangChange(lang.code)}
              aria-pressed={currentLang === lang.code}
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                currentLang === lang.code 
                  ? 'bg-yellow-500 text-emerald-900 shadow-sm' 
                  : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};