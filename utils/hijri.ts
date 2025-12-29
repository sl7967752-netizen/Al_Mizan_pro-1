// Simple tabular Islamic calendar conversion (approximate)
// Based on the Kuwaiti algorithm

export const getHijriMonthName = (monthIndex: number, lang: 'en' | 'ur' | 'hi' | 'ar'): string => {
  const months = {
    en: ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhul-Qi'dah", "Dhul-Hijjah"],
    ur: ["محرم", "صفر", "ربیع الاول", "ربیع الثانی", "جمادی الاول", "جمادی الثانی", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدہ", "ذو الحجہ"],
    ar: ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"],
    hi: ["मुहर्रम", "सफर", "रबी अल-अव्वल", "रबी अल-थानी", "जुमादा अल-अव्वल", "जुमादा अल-थानी", "रजब", "शाबान", "रमजान", "शव्वाल", "धुल-क़ादा", "धुल-हिज्जा"]
  };
  return months[lang][monthIndex] || months.en[monthIndex];
};

export function toHijri(date: Date) {
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y == 1582) {
    if (m > 10) b = -10;
    if (m == 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

  b = 0;
  if (jd > 2299160) {
    a = Math.floor((jd - 1867216.25) / 36524.25);
    b = 1 + a - Math.floor(a / 4);
  }
  let bb = jd + b + 1524;
  let cc = Math.floor((bb - 122.1) / 365.25);
  let dd = Math.floor(365.25 * cc);
  let ee = Math.floor((bb - dd) / 30.6001);
  day = (bb - dd) - Math.floor(30.6001 * ee);
  month = ee - 1;
  if (ee > 13) {
    cc += 1;
    month = ee - 13;
  }
  year = cc - 4716;

  let iyear = 10631.0 / 30.0;
  let epochastro = 1948084;
  let epochcivil = 1948085;

  let shift1 = 8.01 / 60.0;

  let z = jd - epochastro;
  let cyc = Math.floor(z / 10631.0);
  z = z - 10631.0 * cyc;
  let j = Math.floor((z - shift1) / iyear);
  let iy = 30 * cyc + j;
  z = z - Math.floor(j * iyear + shift1);
  let im = Math.floor((z + 28.5001) / 29.5);
  if (im == 13) im = 12;
  let id = z - Math.floor(29.5 * im - 29.0001);

  return { 
    day: id, 
    month: im - 1, // 0-based
    year: iy 
  };
}

export function toGregorian(hDay: number, hMonth: number, hYear: number): Date {
  let iyear = 10631.0 / 30.0;
  let epochastro = 1948084;
  let shift1 = 8.01 / 60.0;
  
  let z = hDay + Math.floor(29.5 * (hMonth + 1) - 29.0001) + Math.floor(hYear * iyear + shift1);
  let b = z + epochastro;
  
  let diff = 0.5; // Correction
  let jd = b + diff;

  let z1 = Math.floor(jd);
  let f = jd - z1;
  let alpha = Math.floor((z1 - 1867216.25) / 36524.25);
  let a = z1 + 1 + alpha - Math.floor(alpha / 4);
  let b1 = a + 1524;
  let c = Math.floor((b1 - 122.1) / 365.25);
  let d = Math.floor(365.25 * c);
  let e = Math.floor((b1 - d) / 30.6001);
  
  let day = Math.floor(b1 - d - Math.floor(30.6001 * e) + f);
  let month = e < 14 ? e - 1 : e - 13;
  let year = month > 2 ? c - 4716 : c - 4715;

  // Month is 1-based in calculation, adjust to 0-based JS Date
  return new Date(year, month - 1, day);
}