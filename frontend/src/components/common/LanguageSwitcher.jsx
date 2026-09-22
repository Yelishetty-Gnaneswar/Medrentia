import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSwitcher = ({ className = '', variant = 'navbar' }) => {
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl ${className}`}>
        {supportedLanguages.map((l) => (
          <button
            key={l.code}
            onClick={() => handleSelect(l.code)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              language === l.code
                ? 'bg-medblue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-medblue-600 hover:bg-slate-200/60'
            }`}
          >
            {l.nativeName}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-medblue-300 rounded-xl shadow-xs transition-all focus:outline-none"
        title="Select Language / భాష / भाषा"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-medblue-600 shrink-0" />
        <span className="font-semibold text-slate-900">{currentLangObj.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
            🌐 Select Language
          </div>
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-medblue-50 transition-colors ${
                language === lang.code ? 'font-bold text-medblue-700 bg-medblue-50/60' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.nativeName}</span>
                <span className="text-[10px] text-slate-400">({lang.name})</span>
              </div>
              {language === lang.code && <Check className="w-3.5 h-3.5 text-medblue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
