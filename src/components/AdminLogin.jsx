import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-1">
      <form onSubmit={handleLogin} className="glass-panel p-8 rounded-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-islamic-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-islamic-primary" />
          </div>
          <h2 className="text-2xl font-bold text-islamic-primary">تسجيل دخول المشرفين</h2>
          <p className="text-gray-500 text-sm mt-1">لوحة التحكم الخاصة بالمسابقة</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2 text-sm">البريد الإلكتروني</label>
            <div className="relative">
              <input
                type="email"
                required
                className="input-field pr-10"
                dir="ltr"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2 text-sm">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                required
                className="input-field pr-10"
                dir="ltr"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الدخول...
              </>
            ) : (
              'دخول'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
