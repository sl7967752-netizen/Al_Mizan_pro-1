import React, { useState, useRef } from 'react';
import { Translation, Language } from '../types';
import { CheckCircle, Info, Sparkles } from 'lucide-react';
import { HijriDatePicker } from './HijriDatePicker';

interface ConditionsProps {
  t: Translation;
  isMuslim: boolean;
  hasOwnership: boolean;
  hawlComplete: boolean;
  hawlDate: string;
  onUpdate: (field: string, value: any) => void;
  onAskAI: (question: string) => void;
  language: Language;
}

export const Conditions: React.FC<ConditionsProps> = ({ 
  t, isMuslim, hasOwnership, hawlComplete, hawlDate, onUpdate, onAskAI, language
}) => {
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveInfo(key);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveInfo(null);
    }, 400); // Delay closing to allow moving mouse to the card
  };

  const handleCardMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const toggleInfo = (key: string) => {
    setActiveInfo(activeInfo === key ? null : key);
  };

  const ExplanationCard = ({ text, type }: { text: string, type: string }) => (
    <div 
      className="mt-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100 animate-in slide-in-from-top-1 fade-in z-10 relative"
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="italic mb-2">
        <span className="font-bold block mb-1 not-italic">Scholar Explanation:</span>
        {text}
      </div>
      <button 
        onClick={() => onAskAI(`Explain the Zakat condition of "${type}" in detail with evidences from Quran and Hadith.`)}
        className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition w-fit"
      >
        <Sparkles className="w-3 h-3" />
        Ask Zakat AI Scholar for more details
      </button>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
      <h2 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-emerald-600" />
        {t.conditions}
      </h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          {/* Muslim Condition */}
          <div onMouseLeave={handleMouseLeave}>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition">
                <input 
                  type="checkbox" 
                  checked={isMuslim}
                  onChange={(e) => onUpdate('isMuslim', e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className={isMuslim ? 'text-emerald-900 font-medium' : 'text-gray-500'}>{t.conditionMuslim}</span>
              </label>
              <button 
                onClick={() => toggleInfo('muslim')}
                onMouseEnter={() => handleMouseEnter('muslim')}
                className="p-2 text-emerald-400 hover:text-emerald-700 transition"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
            {activeInfo === 'muslim' && <ExplanationCard text={t.conditionExplanations.muslim} type="Being Muslim" />}
          </div>
          
          {/* Ownership Condition */}
          <div onMouseLeave={handleMouseLeave}>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition">
                <input 
                  type="checkbox" 
                  checked={hasOwnership}
                  onChange={(e) => onUpdate('hasOwnership', e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className={hasOwnership ? 'text-emerald-900 font-medium' : 'text-gray-500'}>{t.conditionOwnership}</span>
              </label>
              <button 
                onClick={() => toggleInfo('ownership')}
                onMouseEnter={() => handleMouseEnter('ownership')}
                className="p-2 text-emerald-400 hover:text-emerald-700 transition"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
            {activeInfo === 'ownership' && <ExplanationCard text={t.conditionExplanations.ownership} type="Complete Ownership (Milk at-Tamm)" />}
          </div>
        </div>

        <div className="space-y-4">
           {/* Hawl Condition */}
           <div onMouseLeave={handleMouseLeave}>
             <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition">
                <input 
                  type="checkbox" 
                  checked={hawlComplete}
                  onChange={(e) => onUpdate('hawlComplete', e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className={hawlComplete ? 'text-emerald-900 font-medium' : 'text-gray-500'}>{t.conditionHawl}</span>
              </label>
              <button 
                onClick={() => toggleInfo('hawl')}
                onMouseEnter={() => handleMouseEnter('hawl')}
                className="p-2 text-emerald-400 hover:text-emerald-700 transition"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
            {activeInfo === 'hawl' && <ExplanationCard text={t.conditionExplanations.hawl} type="Hawl (One Lunar Year)" />}
          </div>

          <HijriDatePicker 
            value={hawlDate}
            onChange={(date) => onUpdate('hawlStartDate', date)}
            language={language}
            label={t.hawlDate}
          />
        </div>
      </div>
    </div>
  );
};