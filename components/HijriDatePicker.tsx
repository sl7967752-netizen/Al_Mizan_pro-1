import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Language } from '../types';
import { toHijri, toGregorian, getHijriMonthName } from '../utils/hijri';

interface HijriDatePickerProps {
  value: string; // ISO Date String YYYY-MM-DD
  onChange: (date: string) => void;
  language: Language;
  label: string;
}

export const HijriDatePicker: React.FC<HijriDatePickerProps> = ({ value, onChange, language, label }) => {
  const [mode, setMode] = useState<'gregorian' | 'hijri'>('gregorian');
  
  // State for Hijri inputs
  const [hDay, setHDay] = useState(1);
  const [hMonth, setHMonth] = useState(0);
  const [hYear, setHYear] = useState(1445);

  // Sync Hijri state when value changes externally or when switching modes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const hijri = toHijri(date);
        setHDay(hijri.day);
        setHMonth(hijri.month);
        setHYear(hijri.year);
      }
    }
  }, [value]);

  const handleHijriChange = (field: 'day' | 'month' | 'year', val: number) => {
    let d = field === 'day' ? val : hDay;
    let m = field === 'month' ? val : hMonth;
    let y = field === 'year' ? val : hYear;

    // Validation
    if (d < 1) d = 1;
    if (d > 30) d = 30; // Simply cap at 30 for UI, calc handles overflow slightly
    
    setHDay(d);
    setHMonth(m);
    setHYear(y);

    const greg = toGregorian(d, m, y);
    // Format to YYYY-MM-DD
    const iso = greg.toISOString().split('T')[0];
    onChange(iso);
  };

  const hijriString = `${hDay} ${getHijriMonthName(hMonth, language)} ${hYear}`;
  
  // Create Gregorian display string
  const gregDate = new Date(value);
  const gregString = !isNaN(gregDate.getTime()) 
    ? gregDate.toLocaleDateString(language === 'en' ? 'en-US' : language, { dateStyle: 'long' })
    : '';

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex bg-white rounded-lg border border-gray-200 p-0.5">
          <button
            onClick={() => setMode('gregorian')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
              mode === 'gregorian' ? 'bg-emerald-100 text-emerald-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Gregorian
          </button>
          <button
            onClick={() => setMode('hijri')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
              mode === 'hijri' ? 'bg-emerald-100 text-emerald-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Hijri
          </button>
        </div>
      </div>

      {mode === 'gregorian' ? (
        <div className="space-y-2">
          <div className="relative">
            <input 
              type="date" 
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
          <p className="text-xs text-emerald-700 flex items-center gap-1.5 bg-emerald-50 p-2 rounded">
            <span className="font-bold">Hijri:</span> {hijriString}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={hDay}
              onChange={(e) => handleHijriChange('day', parseInt(e.target.value))}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none w-16"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={hMonth}
              onChange={(e) => handleHijriChange('month', parseInt(e.target.value))}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i}>{getHijriMonthName(i, language)}</option>
              ))}
            </select>
            <input
              type="number"
              value={hYear}
              onChange={(e) => handleHijriChange('year', parseInt(e.target.value))}
              className="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Year"
            />
          </div>
          <p className="text-xs text-gray-600 flex items-center gap-1.5 bg-white border border-gray-200 p-2 rounded">
            <span className="font-bold text-gray-500">Gregorian:</span> {gregString}
          </p>
        </div>
      )}
    </div>
  );
};