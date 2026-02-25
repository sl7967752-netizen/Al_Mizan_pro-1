import React, { useState } from 'react';
import { Translation } from '../types';
import { CheckCircle2, ChevronRight, ChevronLeft, XCircle, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EligibilityWizardProps {
  t: Translation;
  onComplete: (results: { isMuslim: boolean; hasOwnership: boolean; hawlComplete: boolean }) => void;
  onClose: () => void;
  currentNetWealth: number;
  nisabThreshold: number;
}

export const EligibilityWizard: React.FC<EligibilityWizardProps> = ({ 
  t, onComplete, onClose, currentNetWealth, nisabThreshold 
}) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    isMuslim: false,
    hasOwnership: false,
    hawlComplete: false,
  });

  const steps = [
    {
      id: 1,
      title: t.wizard.step1,
      question: t.conditionMuslim,
      explanation: t.conditionExplanations.muslim,
      field: 'isMuslim' as const,
    },
    {
      id: 2,
      title: t.wizard.step2,
      question: t.conditionOwnership,
      explanation: t.conditionExplanations.ownership,
      field: 'hasOwnership' as const,
    },
    {
      id: 3,
      title: t.wizard.step3,
      question: t.conditionHawl,
      explanation: t.conditionExplanations.hawl,
      field: 'hawlComplete' as const,
    },
    {
      id: 4,
      title: t.wizard.step4,
      question: `Does your net wealth meet the Nisab threshold?`,
      explanation: `Nisab is the minimum amount of wealth a Muslim must possess before they are obligated to pay Zakat. Your current net wealth is ${currentNetWealth.toFixed(2)} and the threshold is ${nisabThreshold.toFixed(2)}.`,
      field: null, // Calculated
    }
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleAnswer = (field: 'isMuslim' | 'hasOwnership' | 'hawlComplete') => {
    setAnswers({ ...answers, [field]: !answers[field] });
  };

  const isNisabMet = currentNetWealth >= nisabThreshold;
  const isOverallEligible = answers.isMuslim && answers.hasOwnership && answers.hawlComplete && isNisabMet;

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-emerald-800 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-emerald-200 hover:text-white transition"
            aria-label="Close"
          >
            <XCircle className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            {t.wizard.title}
          </h2>
          <p className="text-emerald-100 text-sm mt-1">{t.wizard.description}</p>
          
          {/* Progress Bar */}
          <div className="mt-6 h-1.5 bg-emerald-900/50 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            <span>{t.wizard.step1}</span>
            <span>{t.wizard.step4}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 text-emerald-800 mb-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                  {step}
                </span>
                <h3 className="text-lg font-bold">{currentStep.title}</h3>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <p className="text-gray-800 font-medium text-lg mb-4">
                  {currentStep.question}
                </p>
                
                {currentStep.field ? (
                  <button 
                    onClick={() => toggleAnswer(currentStep.field!)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      answers[currentStep.field!] 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-emerald-200'
                    }`}
                  >
                    <span className="font-bold">{answers[currentStep.field!] ? 'YES' : 'NO'}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentStep.field!] ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                    }`}>
                      {answers[currentStep.field!] && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                  </button>
                ) : (
                  <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                    isNisabMet ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <span className="font-bold">{isNisabMet ? 'THRESHOLD MET' : 'BELOW THRESHOLD'}</span>
                    {isNisabMet ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 italic">
                  <span className="font-bold not-italic block mb-1">Why this matters:</span>
                  {currentStep.explanation}
                </div>
              </div>

              {step === 4 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-xl text-center border-2 ${
                    isOverallEligible ? 'bg-emerald-100 border-emerald-300' : 'bg-gray-100 border-gray-300'
                  }`}
                >
                  <h4 className="font-bold text-lg mb-2">
                    {isOverallEligible ? t.wizard.resultEligible : t.wizard.resultNotEligible}
                  </h4>
                  <p className="text-sm opacity-80">
                    {isOverallEligible 
                      ? "You can now proceed to calculate your exact Zakat amount." 
                      : "Zakat is only obligatory when all conditions are met. You can still give Sadaqah (voluntary charity)."}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between">
          <button 
            onClick={handlePrev}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 font-bold disabled:opacity-30 hover:text-gray-900 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            {t.wizard.prev}
          </button>
          
          {step < 4 ? (
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800 transition shadow-md"
            >
              {t.wizard.next}
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => {
                onComplete(answers);
                onClose();
              }}
              className="flex items-center gap-2 px-8 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition shadow-md"
            >
              <CheckCircle2 className="w-5 h-5" />
              {t.wizard.finish}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
