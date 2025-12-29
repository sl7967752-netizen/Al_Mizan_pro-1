import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppState, Language, Fiqh, NisabStandard, HistoryRecord } from './types';
import { TRANSLATIONS, DEFAULT_ASSETS, DEFAULT_LIABILITIES } from './constants';
import { calculateZakat } from './utils/zakatMath';

import { Header } from './components/Header';
import { Settings } from './components/Settings';
import { Conditions } from './components/Conditions';
import { Financials } from './components/Financials';
import { Result } from './components/Result';
import { History } from './components/History';
import { ZakatAI } from './components/ZakatAI';

function App() {
  // State Initialization
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('zakat_app_state');
    const defaultState = {
      language: 'en' as Language,
      fiqh: 'Hanafi' as Fiqh,
      nisabStandard: 'Silver' as NisabStandard,
      currency: 'USD',
      goldPricePerGram: 65,
      silverPricePerGram: 0.8,
      assets: DEFAULT_ASSETS,
      liabilities: DEFAULT_LIABILITIES,
      hawlStartDate: new Date().toISOString().split('T')[0],
      isMuslim: true,
      hasOwnership: true,
      hawlComplete: true,
      history: [] as HistoryRecord[],
    };

    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure history array exists for users migrating from older version
      if (!parsed.history) parsed.history = [];
      return parsed;
    }
    return defaultState;
  });

  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const aiSectionRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('zakat_app_state', JSON.stringify(state));
    // Update HTML dir and font class
    const isRtl = state.language === 'ur' || state.language === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = state.language;
  }, [state]);

  // Helpers
  const t = TRANSLATIONS[state.language];
  const updateState = (field: string, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const handleAskAI = (question: string) => {
    setAiQuestion(question);
    // Smooth scroll to AI section
    if (aiSectionRef.current) {
      setTimeout(() => {
        aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Calculation
  const result = useMemo(() => {
    const conditionsMet = state.isMuslim && state.hasOwnership && state.hawlComplete;
    return calculateZakat(
      state.assets,
      state.liabilities,
      state.fiqh,
      state.nisabStandard,
      state.goldPricePerGram,
      state.silverPricePerGram,
      conditionsMet
    );
  }, [state]);

  // History Handlers
  const saveToHistory = () => {
    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      hawlDate: state.hawlStartDate,
      currency: state.currency,
      netWealth: result.netZakatableWealth,
      zakatPayable: result.zakatPayable,
      isPaid: false, // Default to unpaid so user tracks arrears
    };

    setState(prev => ({
      ...prev,
      history: [newRecord, ...prev.history]
    }));
  };

  const deleteHistoryRecord = (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setState(prev => ({
        ...prev,
        history: prev.history.filter(h => h.id !== id)
      }));
    }
  };

  const togglePaidStatus = (id: string) => {
    setState(prev => ({
      ...prev,
      history: prev.history.map(h => 
        h.id === id ? { ...h, isPaid: !h.isPaid } : h
      )
    }));
  };

  // Dynamic font class based on language
  let fontClass = '';
  if (state.language === 'ur') fontClass = 'font-urdu';
  else if (state.language === 'hi') fontClass = 'font-hindi';
  else if (state.language === 'ar') fontClass = 'font-arabic';

  return (
    <div className={`min-h-screen pb-10 ${fontClass}`}>
      <Header 
        t={t} 
        currentLang={state.language} 
        onLangChange={(l) => updateState('language', l)} 
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Step 1: Conditions */}
        <Conditions 
          t={t}
          isMuslim={state.isMuslim}
          hasOwnership={state.hasOwnership}
          hawlComplete={state.hawlComplete}
          hawlDate={state.hawlStartDate}
          onUpdate={updateState}
          onAskAI={handleAskAI}
          language={state.language}
        />

        {/* Step 2: Configuration */}
        <Settings 
          t={t}
          fiqh={state.fiqh}
          nisabStandard={state.nisabStandard}
          currency={state.currency}
          goldPrice={state.goldPricePerGram}
          silverPrice={state.silverPricePerGram}
          onUpdate={updateState}
        />

        {/* Step 3: Assets & Liabilities */}
        <Financials 
          t={t}
          assets={state.assets}
          liabilities={state.liabilities}
          fiqh={state.fiqh}
          currency={state.currency}
          goldPrice={state.goldPricePerGram}
          silverPrice={state.silverPricePerGram}
          onUpdateAsset={(assets) => updateState('assets', assets)}
          onUpdateLiability={(liabilities) => updateState('liabilities', liabilities)}
        />

        {/* Step 4: Results */}
        <Result 
          t={t}
          result={result}
          currency={state.currency}
          onSaveHistory={saveToHistory}
        />

        {/* Step 5: History */}
        <History 
          t={t}
          history={state.history}
          currentCurrency={state.currency}
          onDelete={deleteHistoryRecord}
          onTogglePaid={togglePaidStatus}
        />

        {/* Step 6: AI Scholar */}
        <div ref={aiSectionRef}>
          <ZakatAI 
            t={t}
            language={state.language}
            externalQuestion={aiQuestion}
            onQuestionHandled={() => setAiQuestion(null)}
          />
        </div>

      </main>
    </div>
  );
}

export default App;