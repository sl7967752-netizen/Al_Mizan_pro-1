import React from 'react';
import { Moon } from 'lucide-react';
import { Language, Translation } from '../types';

interface HeaderProps {
  t: Translation;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ t, currentLang, onLangChange }) => {
  return (
    <header className="bg-emerald-800 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Moon className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold leading-tight">{t.title}</h1>
            <p className="text-emerald-200 text-xs md:text-sm hidden sm:block">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {(['en', 'ur', 'ar', 'hi'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLangChange(lang)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                currentLang === lang 
                  ? 'bg-yellow-500 text-emerald-900' 
                  : 'bg-emerald-700 text-emerald-100 hover:bg-emerald-600'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};