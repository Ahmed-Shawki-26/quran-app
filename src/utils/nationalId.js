export const GOVERNORATES = {
  '01': 'القاهرة', '02': 'الإسكندرية', '03': 'بورسعيد', '04': 'السويس',
  '11': 'دمياط', '12': 'الدقهلية', '13': 'الشرقية', '14': 'القليوبية',
  '15': 'كفر الشيخ', '16': 'الغربية', '17': 'المنوفية', '18': 'البحيرة',
  '19': 'الإسماعيلية', '21': 'الجيزة', '22': 'بني سويف', '23': 'الفيوم',
  '24': 'المنيا', '25': 'أسيوط', '26': 'سوهاج', '27': 'قنا',
  '28': 'أسوان', '29': 'الأقصر', '31': 'البحر الأحمر', '32': 'الوادي الجديد',
  '33': 'مطروح', '34': 'شمال سيناء', '35': 'جنوب سيناء', '88': 'خارج مصر'
};

export const MINYA_CENTERS = [
  "بني مزار",
  "مغاغة",
  "العدوة",
  "مطاي",
  "سمالوط",
  "المنيا",
  "المنيا الجديدة",
  "ملوي",
  "أبو قرقاص",
  "دير مواس"
];

export const LEVELS = [
  "المستوى الأول (القرآن كاملاً)",
  "المستوى الثاني (ثلاثة أرباع القرآن)",
  "المستوى الثالث (نصف القرآن)",
  "المستوى الرابع (ربع القرآن)",
  "المستوى الخامس (ثلاثة أجزاء)",
  "المستوى السادس (جزء عم)"
];

export function validateNationalID(id) {
  if (!id || typeof id !== 'string') {
    return { isValid: false, error: 'الرقم القومي مطلوب' };
  }
  
  // Remove any spaces
  id = id.trim();
  
  // 1. Check Length and Digits
  if (!/^\d{14}$/.test(id)) {
    return { isValid: false, error: 'الرقم القومي يجب أن يتكون من 14 رقم فقط' };
  }

  // 2. Extract Data
  const centuryCode = parseInt(id.substring(0, 1));
  const yearPart = id.substring(1, 3);
  const monthPart = id.substring(3, 5);
  const dayPart = id.substring(5, 7);
  const governorateCode = id.substring(7, 9);

  // 3. Century Check (2 = 1900s, 3 = 2000s)
  if (centuryCode !== 2 && centuryCode !== 3) {
    return { isValid: false, error: 'الرقم القومي غير صحيح (خطأ في رمز القرن)' };
  }
  
  const fullYear = (centuryCode === 2 ? 1900 : 2000) + parseInt(yearPart);
  const month = parseInt(monthPart);
  const day = parseInt(dayPart);

  // 4. Basic Date Validation
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'الشهر في تاريخ الميلاد غير صحيح' };
  }
  
  if (day < 1 || day > 31) {
    return { isValid: false, error: 'اليوم في تاريخ الميلاد غير صحيح' };
  }

  // 5. Date object validation
  const birthDate = new Date(fullYear, month - 1, day);
  if (
    birthDate.getFullYear() !== fullYear ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return { isValid: false, error: 'تاريخ الميلاد في الرقم القومي غير صحيح' };
  }

  // 6. Check if date is in the future
  if (birthDate > new Date()) {
    return { isValid: false, error: 'تاريخ الميلاد لا يمكن أن يكون في المستقبل' };
  }

  // 7. Governorate Check
  if (!GOVERNORATES[governorateCode]) {
    return { isValid: false, error: 'كود المحافظة في الرقم القومي غير صحيح' };
  }

  // 8. Gender extraction
  const genderDigit = parseInt(id.substring(12, 13));
  const gender = genderDigit % 2 === 1 ? 'ذكر' : 'أنثى';

  return { 
    isValid: true, 
    data: {
      birthDate,
      governorate: GOVERNORATES[governorateCode],
      gender
    }
  };
}
