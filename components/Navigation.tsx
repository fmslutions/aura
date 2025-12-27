
import React, { useState } from 'react';
import { AppView } from '../types';

interface NavigationProps {
  setView: (view: AppView) => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  logoUrl?: string | null;
  labels: {
    features: string;
    pricing: string;
    login: string;
    getStarted: string;
  };
}

export const Navigation: React.FC<NavigationProps> = ({ setView, currentLanguage, onLanguageChange, logoUrl, labels }) => {
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView(AppView.INSTITUTIONAL)}>
          {logoUrl ? (
            <img src={logoUrl} alt="Aura Logo" className="w-10 h-10 object-contain rounded-xl shadow-sm" />
          ) : (
            <div className="w-10 h-10 aura-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-sparkles text-xl"></i>
            </div>
          )}
          <span className="text-2xl font-bold tracking-tight text-slate-800">Aura</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">{labels.features}</a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">{labels.pricing}</a>
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors uppercase text-xs font-bold tracking-widest text-slate-500"
            >
              <i className="fas fa-globe text-indigo-500"></i>
              <span>{currentLanguage}</span>
              <i className={`fas fa-chevron-down text-[8px] transition-transform ${isLangOpen ? 'rotate-180' : ''}`}></i>
            </button>
            
            {isLangOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition-colors ${
                        currentLanguage === lang.code ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span>{lang.flag}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setView(AppView.AUTH)}
            className="text-sm font-semibold text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {labels.login}
          </button>
          <button 
            onClick={() => setView(AppView.AUTH)}
            className="aura-gradient text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            {labels.getStarted}
          </button>
        </div>
      </div>
    </nav>
  );
};
