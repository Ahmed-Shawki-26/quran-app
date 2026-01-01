import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { validateNationalID, MINYA_CENTERS, LEVELS, EXAM_COMMITTEES } from '../utils/nationalId';
import { CheckCircle, AlertCircle, Loader2, Send, User, Phone, MapPin, BookOpen } from 'lucide-react';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    phone: '',
    level: '',
    center: '',
    examCommittee: '',
    address: '',
    goldenPsalms: false
  });

  const [validationState, setValidationState] = useState({
    isValid: false,
    error: '',
    data: null
  });

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleIdChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 14);
    setFormData(prev => ({ ...prev, nationalId: val }));
    
    if (val.length === 14) {
      const result = validateNationalID(val);
      setValidationState(result);
    } else {
      setValidationState({ isValid: false, error: '', data: null });
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setFormData(prev => ({ ...prev, phone: val }));
  };

  const isPhoneValid = formData.phone.length === 11;
  
  // Check if name has exactly 4 parts (3 spaces)
  const isNameValid = () => {
    const trimmed = formData.fullName.trim();
    if (!trimmed) return false;
    const parts = trimmed.split(/\s+/).filter(part => part.length > 0);
    return parts.length === 4;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isLevelValid = formData.goldenPsalms || formData.level;
    
    if (!validationState.isValid || !isPhoneValid || !isNameValid() || 
        !formData.center || !isLevelValid || !formData.examCommittee || formData.address.trim().length < 5) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      // Check for duplicates first
      const { data: existing, error: checkError } = await supabase
        .from('contestants')
        .select('national_id')
        .eq('national_id', formData.nationalId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        throw new Error('⚠️ الرقم القومي مسجل مسبقاً - هذا الرقم القومي تم التسجيل به من قبل في المسابقة. إذا كنت قد سجلت بالفعل، لا يمكنك التسجيل مرة أخرى. للاستفسار، تواصل مع المنسق العام.');
      }

      // Insert new contestant
      const { error } = await supabase
        .from('contestants')
        .insert([
          {
            full_name: formData.fullName.trim(),
            national_id: formData.nationalId,
            phone_number: formData.phone,
            level: formData.level || 'لم يحدد (مزامير ذهبية)',
            center: formData.center,
            exam_committee: formData.examCommittee,
            address: formData.address.trim(),
            governorate_from_id: validationState.data?.governorate || 'غير معروف',
            birth_date: validationState.data?.birthDate?.toISOString().split('T')[0] || null,
            gender: validationState.data?.gender || null,
            golden_psalms: formData.goldenPsalms
          }
        ]);

      if (error) throw error;

      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.');
      setStatus('error');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setFormData({ fullName: '', nationalId: '', phone: '', level: '', center: '', examCommittee: '', address: '', goldenPsalms: false });
    setValidationState({ isValid: false, error: '', data: null });
    setErrorMessage('');
  };

  if (status === 'success') {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center max-w-lg mx-auto animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-islamic-primary" />
        </div>
        <h2 className="text-2xl font-bold text-islamic-primary mb-4">تم التسجيل بنجاح!</h2>
        
        <div className="text-right bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
          <p className="text-gray-700 leading-relaxed">
            تم تسجيل البيانات بنجاح. يرجى التواصل من الآن مع إدارة المسابقة لسحب الإستمارة ولأي تفاصيل أو استفسارات أخرى.
          </p>
          <p className="text-gray-700 leading-relaxed">
            وكذلك لمتابعة أخبار المسابقة ومواعيد الإختبارات لحظة بلحظة انضم الآن إلى جروب المسابقة عبر الرابط التالي:
          </p>
          <a 
            href="https://chat.whatsapp.com/JQVMPfe8ufn9gz02lbeM0Y" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
          >
            <span>📱</span>
            انضم لجروب المسابقة على واتساب
          </a>
          <p className="text-gray-600 text-sm mt-3">
            دمتم في خير وخالص تحيات إدارة مركز شباب الجرنوس
          </p>
        </div>

        <button onClick={resetForm} className="btn-primary">
          تسجيل متسابق آخر
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-1">
      <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-islamic-secondary/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-islamic-primary/10 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/Logos/logo with no bg.png" 
              alt="شعار المسابقة" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-islamic-primary mb-2">تسجيل بيانات المتسابق</h2>
          <p className="text-gray-500">مسابقة الجرنوس الكبرى للقرآن الكريم - الدورة الخامسة</p>
        </div>

        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
              <User className="w-4 h-4 text-islamic-primary" />
              الاسم رباعياً (4 أسماء) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className={`input-field ${formData.fullName.trim().length > 0 ? (isNameValid() ? 'border-green-500' : 'border-red-500') : ''}`}
              placeholder="أحمد محمد علي حسن"
              value={formData.fullName}
              onChange={e => {
                // Only allow Arabic characters and spaces
                const val = e.target.value.replace(/[^\u0600-\u06FF\s]/g, '');
                setFormData({...formData, fullName: val});
              }}
            />
            {formData.fullName.trim().length > 0 && !isNameValid() && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                يجب إدخال الاسم رباعياً (4 أسماء)
              </p>
            )}
            {isNameValid() && (
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                الاسم صحيح ✓
              </p>
            )}
          </div>

          {/* National ID */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
              <BookOpen className="w-4 h-4 text-islamic-primary" />
              الرقم القومي (14 رقم) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                className={`input-field pr-10 text-left ${validationState.isValid ? 'border-green-500 ring-2 ring-green-500/20' : (formData.nationalId.length === 14 && !validationState.isValid ? 'border-red-500 ring-2 ring-red-500/20' : '')}`}
                placeholder="12345678901234 (14 رقم)"
                dir="ltr"
                value={formData.nationalId}
                onChange={handleIdChange}
              />
              <div className="absolute right-3 top-3.5">
                {validationState.isValid && <CheckCircle className="w-5 h-5 text-green-600" />}
                {formData.nationalId.length === 14 && !validationState.isValid && <AlertCircle className="w-5 h-5 text-red-600" />}
              </div>
            </div>
            {validationState.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                <p className="text-red-700 text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{validationState.error}</span>
                </p>
                <p className="text-red-600 text-xs mt-2 mr-7">
                  💡 تأكد من إدخال الرقم القومي بشكل صحيح (14 رقم). الرقم القومي موجود في بطاقة الرقم القومي أو شهادة الميلاد.
                </p>
              </div>
            )}
            {validationState.isValid && validationState.data && (
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                تاريخ الميلاد: {validationState.data.birthDate.toLocaleDateString('ar-EG')} - {validationState.data.governorate} - {validationState.data.gender}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
              <Phone className="w-4 h-4 text-islamic-primary" />
              رقم الهاتف (11 رقم) <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              required
              className={`input-field text-left ${formData.phone.length > 0 ? (isPhoneValid ? 'border-green-500' : 'border-red-500') : ''}`}
              placeholder="01012345678 (11 رقم)"
              dir="ltr"
              value={formData.phone}
              onChange={handlePhoneChange}
            />
            {formData.phone.length > 0 && !isPhoneValid && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                رقم الهاتف يجب أن يكون 11 رقم
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Center */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                <MapPin className="w-4 h-4 text-islamic-primary" />
                المركز <span className="text-red-500">*</span>
              </label>
              <select
                required
                className={`input-field ${formData.center ? 'border-green-500' : ''}`}
                value={formData.center}
                onChange={e => setFormData({...formData, center: e.target.value})}
              >
                <option value="">اختر المركز...</option>
                {MINYA_CENTERS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {formData.center && (
                <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  تم الاختيار ✓
                </p>
              )}
            </div>

            {/* Level */}
            <div>
              <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
                <BookOpen className="w-4 h-4 text-islamic-primary" />
                المستوى {!formData.goldenPsalms && <span className="text-red-500">*</span>}
              </label>
              <select
                required={!formData.goldenPsalms}
                className={`input-field ${formData.level ? 'border-green-500' : ''}`}
                value={formData.level}
                onChange={e => setFormData({...formData, level: e.target.value})}
              >
                <option value="">{formData.goldenPsalms ? 'اختياري في حالة المزامير' : 'اختر مستوى الحفظ...'}</option>
                {LEVELS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              {formData.level && (
                <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  تم الاختيار ✓
                </p>
              )}
            </div>
          </div>

          {/* Qira'at Level Note - Full Width */}
          {formData.level === 'مستوى القراءآت' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-base text-center font-semibold">
                القرآن الكريم كاملا برواية الإمام قالون عن نافع من طريق الشاطبية
              </p>
            </div>
          )}

          {/* Golden Psalms Optional Checkbox */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.goldenPsalms}
                onChange={e => setFormData({...formData, goldenPsalms: e.target.checked})}
                className="w-5 h-5 text-amber-600 rounded border-amber-300 focus:ring-amber-500"
              />
              <div>
                <span className="text-gray-800 font-bold">مستوى المزامير الذهبية</span>
                <span className="text-amber-700 text-sm mr-2">(اختياري لمن يرغب)</span>
              </div>
            </label>
          </div>

          {/* Exam Committee */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
              <MapPin className="w-4 h-4 text-islamic-primary" />
              اختر مكان اللجنة التي تود الاختبار بها <span className="text-red-500">*</span>
            </label>
            <select
              required
              className={`input-field ${formData.examCommittee ? 'border-green-500' : ''}`}
              value={formData.examCommittee}
              onChange={e => setFormData({...formData, examCommittee: e.target.value})}
            >
              <option value="">اختر اللجنة...</option>
              {EXAM_COMMITTEES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {formData.examCommittee && (
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                تم الاختيار ✓
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-bold mb-2">
              <MapPin className="w-4 h-4 text-islamic-primary" />
              العنوان بالتفصيل <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              className={`input-field resize-none ${formData.address.trim().length > 0 ? (formData.address.trim().length >= 5 ? 'border-green-500' : 'border-red-500') : ''}`}
              placeholder="اسم القرية / العزبة / الشارع"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            ></textarea>
            {formData.address.trim().length > 0 && formData.address.trim().length < 5 && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                العنوان قصير جداً (على الأقل 5 أحرف)
              </p>
            )}
            {formData.address.trim().length >= 5 && (
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                العنوان صحيح ✓
              </p>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-lg animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-base">{errorMessage}</p>
                  {errorMessage.includes('مسجل مسبقاً') && (
                    <p className="text-sm mt-2 text-red-600">
                      للتواصل مع المنسق العام: <a href="https://wa.me/201114780031" className="underline font-semibold hover:text-red-800">01114780031</a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'submitting' || !validationState.isValid}
            className="btn-primary flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري التسجيل...
              </>
            ) : (
              <>
                تأكيد التسجيل
                <Send className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
