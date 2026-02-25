import React, { useState } from 'react';
import { Translation, CalculationResult } from '../types';
import { BookOpen, HeartHandshake, Download, Loader2, PenTool, Upload, FileText, Save, Check, QrCode } from 'lucide-react';

interface ResultProps {
  t: Translation;
  result: CalculationResult;
  currency: string;
  onSaveHistory: () => void;
  preparedBy?: string;
  organizationLogo?: string;
  reportNotes?: string;
  onUpdateCustomization: (field: string, value: string) => void;
}

export const Result: React.FC<ResultProps> = ({ 
  t, result, currency, onSaveHistory, 
  preparedBy = '', organizationLogo = '', reportNotes = '', 
  onUpdateCustomization 
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  
  // QR Customization
  const [qrContentMode, setQrContentMode] = useState<'link' | 'summary'>('link');
  const [customQrLink, setCustomQrLink] = useState('https://www.zakat.org/what-is-zakat');

  const formatCurrency = (val: number) => {
    try {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: currency,
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      }).format(val);
    } catch (e) {
      return `${currency} ${val.toFixed(2)}`;
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateCustomization('organizationLogo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveHistory();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('zakat-report-content');
    if (!element) return;

    setIsGeneratingPdf(true);
    
    const html2pdf = (window as any).html2pdf;

    if (html2pdf) {
      const opt = {
        margin:       [0.3, 0.3],
        filename:     'Zakat_Report.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      try {
        await html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error("PDF generation failed", err);
        window.print();
      } finally {
        setIsGeneratingPdf(false);
      }
    } else {
      window.print();
      setIsGeneratingPdf(false);
    }
  };

  // Generate QR Data
  const getQrData = () => {
    if (qrContentMode === 'link') {
      return customQrLink || 'https://www.zakat.org';
    } else {
      return `Zakat Summary:
Net Wealth: ${formatCurrency(result.netZakatableWealth)}
Nisab Threshold: ${formatCurrency(result.nisabThreshold)}
Zakat Payable: ${formatCurrency(result.zakatPayable)}
Date: ${new Date().toLocaleDateString()}`;
    }
  };

  return (
    <div className="mb-8">
      {/* Customization Toggle & Inputs */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100 no-print">
        <button 
          onClick={() => setShowCustomize(!showCustomize)}
          aria-expanded={showCustomize}
          aria-controls="customization-panel"
          className="flex items-center gap-2 text-emerald-700 font-semibold mb-2 hover:text-emerald-800 transition"
        >
          <PenTool className="w-4 h-4" aria-hidden="true" />
          {t.customization.title}
        </button>
        
        {showCustomize && (
          <div id="customization-panel" className="grid md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1" htmlFor="prepared-by-input">{t.customization.preparedBy}</label>
              <input 
                id="prepared-by-input"
                type="text" 
                value={preparedBy}
                onChange={(e) => onUpdateCustomization('preparedBy', e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1" htmlFor="logo-upload">{t.customization.uploadLogo}</label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label 
                  htmlFor="logo-upload" 
                  className="flex items-center gap-2 w-full p-2 border border-gray-200 border-dashed rounded-lg text-sm cursor-pointer hover:bg-gray-50 text-gray-500"
                >
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  {organizationLogo ? 'Logo Uploaded (Click to change)' : 'Choose Image...'}
                </label>
              </div>
            </div>
            
            <div className="md:col-span-2 grid md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
               <div>
                  <label className="block text-sm text-gray-600 mb-1" id="qr-content-label">{t.customization.qrTitle}</label>
                  <div className="flex gap-2 mb-2" role="group" aria-labelledby="qr-content-label">
                     <button 
                       onClick={() => setQrContentMode('link')}
                       aria-pressed={qrContentMode === 'link'}
                       className={`flex-1 text-xs py-1.5 px-2 rounded border ${qrContentMode === 'link' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-gray-200'}`}
                     >
                       {t.customization.qrModeLink}
                     </button>
                     <button 
                       onClick={() => setQrContentMode('summary')}
                       aria-pressed={qrContentMode === 'summary'}
                       className={`flex-1 text-xs py-1.5 px-2 rounded border ${qrContentMode === 'summary' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-gray-200'}`}
                     >
                       {t.customization.qrModeSummary}
                     </button>
                  </div>
                  {qrContentMode === 'link' && (
                    <input 
                      type="text" 
                      value={customQrLink}
                      onChange={(e) => setCustomQrLink(e.target.value)}
                      placeholder={t.customization.qrLinkPlaceholder}
                      aria-label={t.customization.qrLinkPlaceholder}
                      className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  )}
               </div>
               <div>
                  <label className="block text-sm text-gray-600 mb-1" htmlFor="report-notes-input">{t.customization.addNotes}</label>
                  <textarea 
                    id="report-notes-input"
                    value={reportNotes}
                    onChange={(e) => onUpdateCustomization('reportNotes', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 outline-none h-[76px]"
                    placeholder={t.customization.notesPlaceholder}
                  />
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Printable Report Area */}
      <div className="bg-white rounded-xl shadow-lg border border-emerald-100 overflow-hidden print:shadow-none print:border-none" id="zakat-report-content">
        
        {/* Custom Header (Visible if Customization active) */}
        {(organizationLogo || preparedBy) && (
          <div className="p-6 pb-2 border-b border-gray-100 flex justify-between items-center bg-white">
             <div>
               <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
               {preparedBy && <p className="text-sm text-gray-500">{preparedBy}</p>}
             </div>
             {organizationLogo && (
               <img src={organizationLogo} alt="Logo" className="h-12 w-auto object-contain" />
             )}
          </div>
        )}

        <div className="bg-emerald-900 p-6 text-white text-center print:bg-white print:text-black">
          {!organizationLogo && !preparedBy && <h2 className="text-2xl font-bold mb-2">{t.summary}</h2>}
          <div className={`text-4xl font-extrabold my-4 ${result.isEligible ? 'text-yellow-400 print:text-black' : 'text-gray-400'}`} aria-live="polite">
            <span className="sr-only">Zakat Payable:</span>
            {formatCurrency(result.zakatPayable)}
          </div>
          <p className="font-medium text-emerald-200 print:text-gray-600 uppercase tracking-wide">
            {result.isEligible ? t.eligible : t.notEligible}
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
             <div className="p-4 bg-gray-50 rounded-lg print:border print:border-gray-200">
                <p className="text-gray-500 mb-1">{t.netWealth}</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(result.netZakatableWealth)}</p>
             </div>
             <div className="p-4 bg-gray-50 rounded-lg print:border print:border-gray-200">
                <p className="text-gray-500 mb-1">{t.threshold}</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(result.nisabThreshold)}</p>
             </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">{t.assets} Breakdown</h4>
            <div className="space-y-2">
              {result.breakdown.map((item, idx) => (
                item.amount > 0 && (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                )
              ))}
               <div className="flex justify-between text-sm text-red-600 font-medium pt-2 border-t mt-2">
                  <span>{t.liabilities}</span>
                  <span>- {formatCurrency(result.totalLiabilities)}</span>
                </div>
            </div>
          </div>

          {/* Custom Notes Section */}
          {reportNotes && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 print:border-gray-200">
              <h4 className="flex items-center gap-2 font-bold text-yellow-800 mb-2 text-sm">
                <FileText className="w-4 h-4" aria-hidden="true" />
                {t.customization.addNotes}
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{reportNotes}</p>
            </div>
          )}

          {/* References & Distribution */}
          <div className="grid md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-100 print:break-inside-avoid">
            <div>
              <h4 className="flex items-center gap-2 font-bold text-emerald-800 mb-3">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                {t.references}
              </h4>
              <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
                 <li><strong>Quran 9:60:</strong> Specifies the 8 categories of Zakat recipients.</li>
                 <li><strong>Quran 2:43:</strong> "Establish prayer and give Zakat..."</li>
                 <li><strong>Hadith (Bukhari):</strong> "No Zakat is due on property mounting to less than 5 Uqiyas (of silver)..."</li>
                 <li><strong>Hadith (Muslim):</strong> Rate established at 2.5% (1/40th).</li>
              </ul>
            </div>
            <div>
              <h4 className="flex items-center gap-2 font-bold text-emerald-800 mb-3">
                <HeartHandshake className="w-4 h-4" aria-hidden="true" />
                {t.distribution}
              </h4>
               <ul className="text-xs text-gray-600 space-y-1">
                 <li>1. The Poor (Fuqara)</li>
                 <li>2. The Needy (Masakin)</li>
                 <li>3. Zakat Administrators</li>
                 <li>4. Those whose hearts are to be reconciled</li>
                 <li>5. To free captives/slaves</li>
                 <li>6. Those in debt (Gharimin)</li>
                 <li>7. In the cause of Allah (Fisabilillah)</li>
                 <li>8. The Wayfarer (Ibn al-Sabil)</li>
               </ul>
            </div>
          </div>

          {/* QR Code Footer */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between print:flex">
             <div className="text-xs text-gray-400 italic max-w-[70%]">
                {t.disclaimer}
             </div>
             <div className="flex flex-col items-center gap-1">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(getQrData())}`} 
                  alt="QR Code" 
                  className="w-16 h-16 border border-gray-200 p-1"
                  crossOrigin="anonymous"
                />
                <span className="text-[10px] text-gray-500 font-medium">{t.customization.qrLabel}</span>
             </div>
          </div>

          <div className="mt-8 text-center no-print flex flex-col sm:flex-row gap-3 justify-center" data-html2canvas-ignore="true">
            <button 
              onClick={handleSave}
              disabled={justSaved || result.zakatPayable <= 0}
              aria-live="polite"
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition shadow-sm ${
                justSaved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400'
              }`}
            >
              {justSaved ? <Check className="w-4 h-4" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
              {justSaved ? t.history.savedMsg : t.history.saveBtn}
            </button>

            <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              aria-busy={isGeneratingPdf}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-800 rounded-lg font-semibold hover:bg-emerald-200 transition disabled:opacity-50 shadow-sm"
            >
              {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Download className="w-4 h-4" aria-hidden="true" />}
              {t.printReport}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};