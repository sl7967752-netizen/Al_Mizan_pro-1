import React, { useState } from 'react';
import { Translation, Fiqh, NisabStandard } from '../types';
import { Settings as SettingsIcon, RefreshCw, Loader2, ExternalLink } from 'lucide-react';
import { GOLD_NISAB_GRAMS, SILVER_NISAB_GRAMS, CURRENCIES } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface SettingsProps {
  t: Translation;
  fiqh: Fiqh;
  nisabStandard: NisabStandard;
  currency: string;
  goldPrice: number;
  silverPrice: number;
  onUpdate: (field: string, value: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  t, fiqh, nisabStandard, currency, goldPrice, silverPrice, onUpdate
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceTitle, setSourceTitle] = useState<string | null>(null);

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || currency;

  const fetchLiveRates = async () => {
    setIsFetching(true);
    setSourceUrl(null);
    setSourceTitle(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Find the current live market price for 1 gram of 24k Gold and 1 gram of Silver in ${currency}. 
      Return ONLY a JSON object with keys "gold" and "silver" containing the numeric price per gram. 
      Example format: {"gold": 65.50, "silver": 0.85}. Do not include any markdown formatting.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (text) {
        try {
          const rates = JSON.parse(text.trim());
          if (typeof rates.gold === 'number') onUpdate('goldPricePerGram', rates.gold);
          if (typeof rates.silver === 'number') onUpdate('silverPricePerGram', rates.silver);
        } catch (e) {
          console.error("Failed to parse rates", e);
        }
      }

      // Extract Grounding Metadata
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks && groundingChunks.length > 0) {
        const webSource = groundingChunks.find((c: any) => c.web);
        if (webSource) {
          setSourceUrl(webSource.web.uri);
          setSourceTitle(webSource.web.title);
        }
      }

    } catch (error) {
      console.error("Error fetching rates", error);
      alert("Could not fetch live rates. Please check your internet connection.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
      <h2 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
        <SettingsIcon className="w-5 h-5 text-emerald-600" />
        {t.settings}
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Fiqh, Nisab Standard & Currency */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.selectCurrency}</label>
            <select
              value={currency}
              onChange={(e) => onUpdate('currency', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-gray-900"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.fiqh}</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onUpdate('fiqh', 'Hanafi')}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${
                  fiqh === 'Hanafi' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Hanafi
              </button>
              <button
                onClick={() => onUpdate('fiqh', 'Shafi')}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${
                  fiqh === 'Shafi' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Shafi / Maliki
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t.notes}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.nisabBasis}</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onUpdate('nisabStandard', 'Gold')}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${
                  nisabStandard === 'Gold' ? 'bg-yellow-100 text-yellow-800 shadow-sm' : 'text-gray-500'
                }`}
              >
                {t.assetTypes.gold} ({GOLD_NISAB_GRAMS}g)
              </button>
              <button
                onClick={() => onUpdate('nisabStandard', 'Silver')}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition ${
                  nisabStandard === 'Silver' ? 'bg-slate-200 text-slate-800 shadow-sm' : 'text-gray-500'
                }`}
              >
                {t.assetTypes.silver} ({SILVER_NISAB_GRAMS}g)
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1 italic">
              {nisabStandard === 'Silver' 
               ? 'Recommended for maximum caution (benefits the poor more).' 
               : 'Higher threshold.'}
            </p>
          </div>
        </div>

        {/* Prices */}
        <div className="space-y-4">
           <div className="flex justify-between items-center">
             <h3 className="text-sm font-semibold text-gray-700">Market Rates</h3>
             <button
              onClick={fetchLiveRates}
              disabled={isFetching}
              className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1 hover:bg-emerald-100 transition disabled:opacity-50"
             >
               {isFetching ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
               {isFetching ? t.fetching : t.fetchRates}
             </button>
           </div>
           
           {sourceUrl && (
             <div className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 p-2 rounded">
               <span className="font-medium">{t.source}:</span>
               <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5">
                 {sourceTitle || 'External Link'}
                 <ExternalLink className="w-3 h-3" />
               </a>
             </div>
           )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.goldPrice}</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm font-bold pointer-events-none">{currencySymbol}</span>
              <input
                type="number"
                min="0"
                value={goldPrice || ''}
                onChange={(e) => onUpdate('goldPricePerGram', parseFloat(e.target.value) || 0)}
                className="w-full p-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.silverPrice}</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm font-bold pointer-events-none">{currencySymbol}</span>
              <input
                type="number"
                min="0"
                value={silverPrice || ''}
                onChange={(e) => onUpdate('silverPricePerGram', parseFloat(e.target.value) || 0)}
                className="w-full p-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};