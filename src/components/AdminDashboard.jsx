import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MINYA_CENTERS, LEVELS } from '../utils/nationalId';
import { Search, Filter, LogOut, Users, Download, Loader2, Edit2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    center: '',
    level: ''
  });
  const [editingRow, setEditingRow] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContestants();
  }, []);

  const fetchContestants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contestants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContestants(data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleDelete = async (nationalId) => {
    try {
      const { error } = await supabase
        .from('contestants')
        .delete()
        .eq('national_id', nationalId);

      if (error) throw error;
      
      setContestants(contestants.filter(c => c.national_id !== nationalId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('contestants')
        .update({
          full_name: editingRow.full_name,
          phone_number: editingRow.phone_number,
          level: editingRow.level,
          center: editingRow.center,
          address: editingRow.address
        })
        .eq('national_id', editingRow.national_id);

      if (error) throw error;

      setContestants(contestants.map(c => 
        c.national_id === editingRow.national_id ? editingRow : c
      ));
      setEditingRow(null);
    } catch (error) {
      console.error('Error updating:', error);
      alert('حدث خطأ أثناء التحديث');
    }
  };

  const filteredData = contestants.filter(item => {
    const matchSearch = (item.full_name?.toLowerCase() || '').includes(filters.search.toLowerCase()) || 
                        (item.national_id || '').includes(filters.search);
    const matchCenter = !filters.center || item.center === filters.center;
    const matchLevel = !filters.level || item.level === filters.level;
    return matchSearch && matchCenter && matchLevel;
  });

  const stats = {
    total: contestants.length
  };

  const downloadCSV = () => {
    const headers = ['الاسم', 'الرقم القومي', 'الهاتف', 'المستوى', 'المركز', 'العنوان', 'تاريخ التسجيل'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        `"${row.full_name}"`,
        `"${row.national_id}"`,
        `"${row.phone_number}"`,
        `"${row.level}"`,
        `"${row.center}"`,
        `"${row.address}"`,
        `"${new Date(row.created_at).toLocaleDateString('ar-EG')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contestants_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-islamic-primary">لوحة التحكم</h1>
          <p className="text-gray-500">إدارة بيانات المتسابقين</p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadCSV} className="btn-primary bg-blue-600 hover:bg-blue-700 w-auto px-4 py-2 text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            تصدير CSV
          </button>
          <button onClick={handleLogout} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors">
            <LogOut className="w-4 h-4" />
            تسجيل خروج
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">إجمالي المسجلين</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-gray-700 font-bold border-b pb-2">
          <Filter className="w-5 h-5 text-islamic-primary" />
          تصفية البحث
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="بحث بالاسم أو الرقم القومي..."
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
          </div>

          <select
            className="input-field"
            value={filters.center}
            onChange={e => setFilters({...filters, center: e.target.value})}
          >
            <option value="">كل المراكز</option>
            {MINYA_CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="input-field"
            value={filters.level}
            onChange={e => setFilters({...filters, level: e.target.value})}
          >
            <option value="">كل المستويات</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-gray-600 font-bold text-sm">الاسم</th>
                <th className="px-6 py-4 text-gray-600 font-bold text-sm">الرقم القومي</th>
                <th className="px-6 py-4 text-gray-600 font-bold text-sm">رقم الهاتف</th>
                <th className="px-6 py-4 text-gray-600 font-bold text-sm">المستوى</th>
                <th className="px-6 py-4 text-gray-600 font-bold text-sm">المركز</th>
                <th className="px-6 py-4 text-gray-600 font-bold text-sm">تاريخ التسجيل</th>
                <th className="px-6 py-4 text-gray-600 font-bold text-sm">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    جاري تحميل البيانات...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                    لا توجد بيانات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.national_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.full_name}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm" dir="ltr">{row.national_id}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm" dir="ltr">{row.phone_number}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      <span className="inline-block px-2 py-1 rounded-full bg-islamic-primary/10 text-islamic-primary text-xs font-bold">
                        {row.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{row.center}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(row.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingRow({...row})}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(row)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
          <span>عدد النتائج: {filteredData.length}</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-islamic-primary">تعديل بيانات المتسابق</h2>
              <button onClick={() => setEditingRow(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">الاسم</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingRow.full_name}
                  onChange={e => setEditingRow({...editingRow, full_name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  className="input-field"
                  value={editingRow.phone_number}
                  onChange={e => setEditingRow({...editingRow, phone_number: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">المركز</label>
                  <select
                    className="input-field"
                    value={editingRow.center}
                    onChange={e => setEditingRow({...editingRow, center: e.target.value})}
                  >
                    {MINYA_CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">المستوى</label>
                  <select
                    className="input-field"
                    value={editingRow.level}
                    onChange={e => setEditingRow({...editingRow, level: e.target.value})}
                  >
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">العنوان</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  value={editingRow.address}
                  onChange={e => setEditingRow({...editingRow, address: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleUpdate} className="btn-primary bg-blue-600 hover:bg-blue-700">
                  حفظ التعديلات
                </button>
                <button onClick={() => setEditingRow(null)} className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">تأكيد الحذف</h2>
            <p className="text-gray-700 mb-6">
              هل أنت متأكد من حذف بيانات <strong>{deleteConfirm.full_name}</strong>؟
              <br />
              <span className="text-sm text-gray-500">لا يمكن التراجع عن هذا الإجراء</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm.national_id)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
              >
                حذف نهائياً
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
