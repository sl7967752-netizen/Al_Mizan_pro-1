import React from 'react';
import { Translation, Asset, Liability, Fiqh } from '../types';
import { Trash2, Wallet, TrendingDown } from 'lucide-react';
import { CURRENCIES } from '../constants';

interface FinancialsProps {
  t: Translation;
  assets: Asset[];
  liabilities: Liability[];
  fiqh: Fiqh;
  currency: string;
  goldPrice: number;
  silverPrice: number;
  onUpdateAsset: (updated: Asset[]) => void;
  onUpdateLiability: (updated: Liability[]) => void;
}

export const Financials: React.FC<FinancialsProps> = ({
  t, assets, liabilities, fiqh, currency, goldPrice, silverPrice, onUpdateAsset, onUpdateLiability
}) => {
  
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || currency;

  const handleAssetChange = (id: string, field: keyof Asset, value: any) => {
    const updated = assets.map(a => a.id === id ? { ...a, [field]: value } : a);
    onUpdateAsset(updated);
  };

  const handleLiabilityChange = (id: string, field: keyof Liability, value: any) => {
    const updated = liabilities.map(l => l.id === id ? { ...l, [field]: value } : l);
    onUpdateLiability(updated);
  };

  const addNewAsset = () => {
    const newId = (Math.max(...assets.map(a => parseInt(a.id))) + 1).toString();
    onUpdateAsset([...assets, { id: newId, type: 'cash', name: 'New Asset', value: 0, isZakatable: true }]);
  };

  const addNewLiability = () => {
    const newId = (Math.max(0, ...liabilities.map(l => parseInt(l.id))) + 1).toString();
    onUpdateLiability([...liabilities, { id: newId, name: 'New Liability', amount: 0 }]);
  };

  const removeAsset = (id: string) => {
    onUpdateAsset(assets.filter(a => a.id !== id));
  };

  const removeLiability = (id: string) => {
    onUpdateLiability(liabilities.filter(l => l.id !== id));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 mb-6">
      {/* Assets Column */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
        <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-600" />
          {t.assets}
        </h3>
        <div className="space-y-4">
          {assets.map((asset) => (
            <div key={asset.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-emerald-200 transition">
              <div className="flex justify-between items-start mb-2">
                <select 
                  value={asset.type}
                  onChange={(e) => handleAssetChange(asset.id, 'type', e.target.value)}
                  className="bg-transparent text-sm font-semibold text-emerald-800 outline-none cursor-pointer"
                >
                  {Object.entries(t.assetTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <button onClick={() => removeAsset(asset.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={asset.name}
                  onChange={(e) => handleAssetChange(asset.id, 'name', e.target.value)}
                  className="flex-1 text-sm bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-emerald-500"
                  placeholder="Asset Name"
                />
                <div className="relative w-32 md:w-40">
                  <input
                    type="number"
                    min="0"
                    value={asset.value || ''}
                    onChange={(e) => handleAssetChange(asset.id, 'value', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-emerald-500 text-right pr-8"
                  />
                  <span className="absolute right-2 top-1.5 text-xs text-gray-500 pointer-events-none">
                    {['gold', 'silver', 'jewelry'].includes(asset.type) ? t.gram : currencySymbol}
                  </span>
                </div>
              </div>
               {/* Fiqh Warning for Jewelry */}
               {asset.type === 'jewelry' && fiqh === 'Shafi' && (
                <p className="text-xs text-orange-600 mt-2 bg-orange-50 p-1 rounded">
                  * Verify if zakatable under Shafi (personal use is exempt).
                </p>
              )}
            </div>
          ))}
          <button 
            onClick={addNewAsset}
            className="w-full py-2 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-50 transition"
          >
            {t.addAsset}
          </button>
        </div>
      </div>

      {/* Liabilities Column */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
        <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-red-600" />
          {t.liabilities}
        </h3>
        <div className="space-y-4">
          {liabilities.map((liability) => (
            <div key={liability.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-red-200 transition">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-red-800">{t.liabilityTypes.loan} / Others</span>
                <button onClick={() => removeLiability(liability.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                 <input
                  type="text"
                  value={liability.name}
                  onChange={(e) => handleLiabilityChange(liability.id, 'name', e.target.value)}
                  className="flex-1 text-sm bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-red-500"
                  placeholder="Liability Name"
                />
                <div className="relative w-32 md:w-40">
                  <input
                    type="number"
                    min="0"
                    value={liability.amount || ''}
                    onChange={(e) => handleLiabilityChange(liability.id, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full text-sm bg-white border border-gray-200 rounded px-2 py-1 outline-none focus:border-red-500 text-right pr-8"
                  />
                  <span className="absolute right-2 top-1.5 text-xs text-gray-500 pointer-events-none">{currencySymbol}</span>
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={addNewLiability}
            className="w-full py-2 border-2 border-dashed border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
          >
            {t.addLiability}
          </button>
        </div>
      </div>
    </div>
  );
};