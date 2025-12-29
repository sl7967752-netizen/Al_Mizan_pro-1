import React from 'react';
import { Translation, HistoryRecord } from '../types';
import { Clock, Trash2, CheckCircle2, XCircle, Calculator } from 'lucide-react';
import { CURRENCIES } from '../constants';

interface HistoryProps {
  t: Translation;
  history: HistoryRecord[];
  currentCurrency: string;
  onDelete: (id: string) => void;
  onTogglePaid: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({ t, history, currentCurrency, onDelete, onTogglePaid }) => {
  const formatCurrency = (val: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: currencyCode,
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      }).format(val);
    } catch (e) {
      return `${currencyCode} ${val.toFixed(0)}`;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalArrears = history
    .filter(h => !h.isPaid && h.currency === currentCurrency)
    .reduce((sum, h) => sum + h.zakatPayable, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div>
           <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            {t.history.title}
          </h2>
          <p className="text-sm text-slate-500">{t.history.subtitle}</p>
        </div>
        
        {totalArrears > 0 && (
          <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 text-right">
             <span className="text-xs text-red-600 font-semibold block">{t.history.totalArrears}</span>
             <span className="text-lg font-bold text-red-800">{formatCurrency(totalArrears, currentCurrency)}</span>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>{t.history.empty}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div 
              key={record.id} 
              className={`p-4 rounded-lg border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                record.isPaid ? 'bg-white border-gray-200' : 'bg-red-50 border-red-100'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {formatDate(record.timestamp)}
                  </span>
                  {record.isPaid ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3" /> {t.history.status}: {t.history.markPaid}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                      <XCircle className="w-3 h-3" /> {t.history.status}: {t.history.markUnpaid}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-700">
                   <div className="flex items-center gap-1">
                     <span className="text-slate-500">{t.history.hawlDate}:</span>
                     <span className="font-medium">{record.hawlDate}</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <span className="text-slate-500">{t.netWealth}:</span>
                     <span className="font-medium">{formatCurrency(record.netWealth, record.currency)}</span>
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4">
                 <div className="text-right">
                    <span className="text-xs text-slate-500 block">{t.history.zakatAmount}</span>
                    <span className="text-xl font-bold text-emerald-700">
                      {formatCurrency(record.zakatPayable, record.currency)}
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                    <button 
                      onClick={() => onTogglePaid(record.id)}
                      className={`p-2 rounded-full hover:bg-gray-100 transition ${
                        record.isPaid ? 'text-gray-400' : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={record.isPaid ? t.history.markUnpaid : t.history.markPaid}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onDelete(record.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                      title={t.history.delete}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};