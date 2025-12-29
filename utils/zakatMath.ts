import { Asset, Liability, Fiqh, NisabStandard, CalculationResult } from '../types';
import { GOLD_NISAB_GRAMS, SILVER_NISAB_GRAMS } from '../constants';

export const calculateZakat = (
  assets: Asset[],
  liabilities: Liability[],
  fiqh: Fiqh,
  nisabStandard: NisabStandard,
  goldPrice: number,
  silverPrice: number,
  conditionsMet: boolean
): CalculationResult => {
  
  let totalAssetsValue = 0;
  const breakdown: { label: string; amount: number }[] = [];

  assets.forEach(asset => {
    if (!asset.isZakatable) return;

    let assetValue = 0;

    switch (asset.type) {
      case 'cash':
      case 'business':
      case 'investment':
      case 'crypto':
        assetValue = asset.value;
        break;
      case 'gold':
        assetValue = asset.value * goldPrice;
        break;
      case 'silver':
        assetValue = asset.value * silverPrice;
        break;
      case 'jewelry':
        // Fiqh Logic: Shafi typically exempts women's jewelry used for personal ornamentation
        // unless it exceeds moderation (Urdu/Hindi local tradition often taxes it to be safe).
        // For this app, strict Shafi toggle will exempt jewelry unless user explicitly adds it as 'Gold' type instead of 'Jewelry'.
        // However, user instructions said "Jewellery (Hanafi: zakatable)".
        // We will apply this rule: If Shafi AND type is Jewelry, value is 0. Else calculated as Gold.
        if (fiqh === 'Shafi') {
            assetValue = 0; 
        } else {
            // Treat as gold value for simplicity, or we would need a mix input. 
            // Assuming input is grams of Gold jewelry.
            assetValue = asset.value * goldPrice;
        }
        break;
      default:
        assetValue = asset.value;
    }

    if (assetValue > 0) {
        totalAssetsValue += assetValue;
        breakdown.push({ label: asset.name, amount: assetValue });
    }
  });

  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
  const netZakatableWealth = Math.max(0, totalAssetsValue - totalLiabilities);
  
  const nisabThreshold = nisabStandard === 'Gold' 
    ? GOLD_NISAB_GRAMS * goldPrice 
    : SILVER_NISAB_GRAMS * silverPrice;

  // Final Eligibility Check
  // Must meet Shar'ai conditions (checkboxes) AND Net Wealth >= Nisab
  const isEligible = conditionsMet && (netZakatableWealth >= nisabThreshold);
  const zakatPayable = isEligible ? netZakatableWealth * 0.025 : 0;

  return {
    totalAssetsValue,
    totalLiabilities,
    netZakatableWealth,
    nisabThreshold,
    isEligible,
    zakatPayable,
    breakdown
  };
};