export type Language = 'en' | 'ur' | 'hi' | 'ar';
export type Fiqh = 'Hanafi' | 'Shafi';
export type NisabStandard = 'Gold' | 'Silver';

export interface Asset {
  id: string;
  type: 'cash' | 'gold' | 'silver' | 'business' | 'investment' | 'crypto' | 'jewelry';
  name: string;
  value: number; // For cash/business/investments/crypto this is currency value. For Gold/Silver/Jewelry this is Grams.
  isZakatable: boolean;
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  hawlDate: string;
  currency: string;
  netWealth: number;
  zakatPayable: number;
  isPaid: boolean;
}

export interface AppState {
  language: Language;
  fiqh: Fiqh;
  nisabStandard: NisabStandard;
  currency: string;
  goldPricePerGram: number;
  silverPricePerGram: number;
  assets: Asset[];
  liabilities: Liability[];
  hawlStartDate: string;
  isMuslim: boolean;
  hasOwnership: boolean;
  hawlComplete: boolean;
  history: HistoryRecord[];
}

export interface CalculationResult {
  totalAssetsValue: number;
  totalLiabilities: number;
  netZakatableWealth: number;
  nisabThreshold: number;
  isEligible: boolean;
  zakatPayable: number;
  breakdown: { label: string; amount: number }[];
}

export interface Translation {
  title: string;
  subtitle: string;
  settings: string;
  fiqh: string;
  language: string;
  goldPrice: string;
  silverPrice: string;
  nisabBasis: string;
  assets: string;
  liabilities: string;
  calculate: string;
  summary: string;
  totalZakat: string;
  netWealth: string;
  threshold: string;
  eligible: string;
  notEligible: string;
  conditions: string;
  conditionMuslim: string;
  conditionOwnership: string;
  conditionHawl: string;
  conditionExplanations: {
    muslim: string;
    ownership: string;
    hawl: string;
  };
  hawlDate: string;
  addAsset: string;
  addLiability: string;
  assetTypes: {
    cash: string;
    gold: string;
    silver: string;
    business: string;
    investment: string;
    crypto: string;
    jewelry: string;
  };
  liabilityTypes: {
    loan: string;
    bills: string;
    emi: string;
  };
  references: string;
  distribution: string;
  printReport: string;
  currency: string;
  selectCurrency: string;
  gram: string;
  notes: string;
  disclaimer: string;
  fetchRates: string;
  fetching: string;
  source: string;
  aiSection: {
    title: string;
    placeholder: string;
    send: string;
    disclaimer: string;
    welcome: string;
  };
  customization: {
    title: string;
    preparedBy: string;
    uploadLogo: string;
    addNotes: string;
    notesPlaceholder: string;
    qrLabel: string;
  };
  history: {
    title: string;
    subtitle: string;
    saveBtn: string;
    empty: string;
    savedMsg: string;
    recordDate: string;
    hawlDate: string;
    zakatAmount: string;
    status: string;
    markPaid: string;
    markUnpaid: string;
    delete: string;
    totalArrears: string;
  };
}