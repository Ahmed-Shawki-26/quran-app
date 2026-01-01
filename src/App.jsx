import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-islamic-bg to-amber-50 relative" dir="rtl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23047857' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-islamic-primary/10 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img 
                    src="/Logos/logo with no bg.png" 
                    alt="شعار المسابقة" 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-islamic-primary">مسابقة الجرنوس الكبرى للقرآن الكريم</h1>
                  <p className="text-xs text-gray-500">الدورة الخامسة - محافظة المنيا - العام الهجري ١٤٤٦</p>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-semibold">المنسق العام للمسابقة:</span> م/محمد حسان - 
                    <a 
                      href="https://wa.me/201114780031" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-mono text-green-600 hover:text-green-700 hover:underline transition-colors"
                      dir="ltr"
                    >
                      01114780031
                    </a>
                  </p>
                </div>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
            <Routes>
              <Route path="/" element={<RegistrationForm />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-gradient-to-r from-islamic-primary to-emerald-700 text-white py-6 mt-auto">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <p className="opacity-90 text-sm">جميع الحقوق محفوظة © ٢٠٢٦  - مسابقة الجرنوس الكبرى للقرآن الكريم</p>
                <Link 
                  to="/admin/login" 
                  className="inline-block mt-2 opacity-50 hover:opacity-100 transition-opacity text-xs"
                  title="تسجيل دخول المشرفين"
                >
                  لوحة التحكم
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;
