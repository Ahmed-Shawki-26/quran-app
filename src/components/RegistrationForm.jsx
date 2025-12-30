import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { validateNationalID, MINYA_CENTERS, LEVELS } from '../utils/nationalId';
import { CheckCircle, AlertCircle, Loader2, Send, User, Phone, MapPin, BookOpen } from 'lucide-react';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    phone: '',
    level: '',
    center: '',
    address: ''
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
    if (!validationState.isValid || !isPhoneValid || !isNameValid() || 
        !formData.center || !formData.level || formData.address.trim().length < 5) return;

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
        throw new Error('هذا الرقم القومي مسجل بالفعل في المسابقة.');
      }

      // Insert new contestant
      const { error } = await supabase
        .from('contestants')
        .insert([
          {
            full_name: formData.fullName.trim(),
            national_id: formData.nationalId,
            phone_number: formData.phone,
            level: formData.level,
            center: formData.center,
            address: formData.address.trim(),
            governorate_from_id: validationState.data?.governorate || 'غير معروف'
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
    setFormData({ fullName: '', nationalId: '', phone: '', level: '', center: '', address: '' });
    setValidationState({ isValid: false, error: '', data: null });
    setErrorMessage('');
  };

  if (status === 'success') {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center max-w-md mx-auto animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-islamic-primary" />
        </div>
        <h2 className="text-2xl font-bold text-islamic-primary mb-2">تم التسجيل بنجاح!</h2>
        <p className="text-gray-600 mb-6">بارك الله فيك. تم حفظ بياناتك بنجاح في مسابقة القرآن الكريم.</p>
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
          <h2 className="text-3xl font-bold text-islamic-primary mb-2">تسجيل بيانات المتسابق</h2>
          <p className="text-gray-500">مسابقة حفظ القرآن الكريم</p>
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
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationState.error}
              </p>
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
                المستوى <span className="text-red-500">*</span>
              </label>
              <select
                required
                className={`input-field ${formData.level ? 'border-green-500' : ''}`}
                value={formData.level}
                onChange={e => setFormData({...formData, level: e.target.value})}
              >
                <option value="">اختر مستوى الحفظ...</option>
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
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{errorMessage}</p>
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
