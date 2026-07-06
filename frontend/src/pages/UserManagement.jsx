import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  X,
  Check,
  Shield,
  ShieldCheck,
  Mail,
  Search,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  UserCog,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import axiosClient from '../api/axiosClient';

/* ──────────────────────────────────────────────
   Role & Status theme configuration
   ────────────────────────────────────────────── */
const ROLE_THEME = {
  admin:    { bg: 'bg-blue-100',   text: 'text-blue-800',   icon: ShieldCheck, label: 'Admin' },
  operator: { bg: 'bg-violet-100', text: 'text-violet-800', icon: Shield,      label: 'Operator' },
  user:     { bg: 'bg-slate-100',  text: 'text-slate-700',  icon: UserCog,     label: 'User' },
};

const EMPTY_FORM = { nama: '', email: '', password: '' };

/* ──────────────────────────────────────────────
   Error Banner
   ────────────────────────────────────────────── */
function ErrorBanner({ message, onRetry, onDismiss }) {
  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-sm">
      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-800">Terjadi Kesalahan</p>
        <p className="text-xs text-red-600 mt-0.5">{message}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Lagi
          </button>
        )}
        <button
          onClick={onDismiss}
          className="text-xs font-medium text-red-400 hover:text-red-600 px-2 py-1.5 transition-colors cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /* ── Fetch users from API ── */
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.get('/users');
      setUsers(data.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memuat daftar pengguna.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ── Filtered users ── */
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Counters ── */
  const operatorCount = users.filter((u) => u.role === 'operator').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  /* ── Success message helper ── */
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  /* ── Handlers ── */
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (editingId !== null) {
        // Update existing user
        const payload = { name: form.nama, email: form.email };
        if (form.password.trim()) {
          payload.password = form.password;
        }
        const { data } = await axiosClient.put(`/users/${editingId}`, payload);
        setUsers((prev) =>
          prev.map((u) => (u.id === editingId ? (data.data || { ...u, ...payload }) : u))
        );
        setEditingId(null);
        showSuccess('Data pengguna berhasil diperbarui!');
      } else {
        // Create new operator
        const payload = {
          name: form.nama,
          email: form.email,
          password: form.password,
        };
        const { data } = await axiosClient.post('/users', payload);
        setUsers((prev) => [data.data || payload, ...prev]);
        showSuccess('Operator baru berhasil ditambahkan!');
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      setShowPassword(false);
      // Refresh data to get accurate data from server
      fetchUsers();
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errors) {
        const messages = Object.values(errData.errors).flat().join(' ');
        setError(messages);
      } else {
        setError(errData?.message || 'Terjadi kesalahan saat menyimpan data.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setForm({ nama: user.name, email: user.email, password: '' });
    setShowForm(true);
    setShowPassword(false);
    document.getElementById('user-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
    setShowPassword(false);
    setError(null);
  };

  const confirmDelete = async (id) => {
    try {
      await axiosClient.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setShowDeleteModal(null);
      showSuccess('Pengguna berhasil dihapus!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus pengguna.';
      setError(msg);
      setShowDeleteModal(null);
    }
  };

  const isFormValid = editingId
    ? form.nama.trim() !== '' && form.email.trim() !== ''
    : form.nama.trim() !== '' && form.email.trim() !== '' && form.password.trim().length >= 8;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Page title + action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Manajemen Pengguna
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelola akun operator sistem monitoring
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) cancelForm();
            }}
            id="add-user-btn"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Operator
          </button>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <ErrorBanner
            message={error}
            onRetry={fetchUsers}
            onDismiss={() => setError(null)}
          />
        )}

        {/* ── Success Banner ── */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <Check className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800">Berhasil</p>
              <p className="text-xs text-emerald-600 mt-0.5">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-600 px-2 py-1.5 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ── Summary counters ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total</p>
              <p className="text-xl font-extrabold text-slate-900">{users.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Operator</p>
              <p className="text-xl font-extrabold text-violet-700">{operatorCount}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">User</p>
              <p className="text-xl font-extrabold text-slate-700">{userCount}</p>
            </div>
          </div>
        </div>

        {/* ── Add/Edit Form (collapsible) ── */}
        {showForm && (
          <section
            id="user-form"
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {editingId ? 'Edit Pengguna' : 'Tambah Operator Baru'}
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              {editingId
                ? 'Ubah informasi pengguna. Biarkan password kosong jika tidak ingin mengubahnya.'
                : 'Isi data operator baru. Admin menentukan password operator.'}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {/* Nama */}
                <div>
                  <label htmlFor="input-nama" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    id="input-nama"
                    type="text"
                    value={form.nama}
                    onChange={(e) => handleChange('nama', e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    required
                  />
                </div>
                {/* Email */}
                <div>
                  <label htmlFor="input-email" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="input-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                      required
                    />
                  </div>
                </div>
                {/* Password */}
                <div className="sm:col-span-2">
                  <label htmlFor="input-password" className="block text-sm font-semibold text-slate-800 mb-1.5">
                    Password {editingId && <span className="text-xs font-normal text-slate-400">(opsional — kosongkan jika tidak ingin mengubah)</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="input-password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder={editingId ? 'Biarkan kosong jika tidak diubah' : 'Minimal 8 karakter'}
                      className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                      required={!editingId}
                      minLength={editingId ? 0 : 8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {!editingId && form.password.length > 0 && form.password.length < 8 && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Password minimal 8 karakter
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  id="user-submit-btn"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan…</>
                  ) : editingId ? (
                    <><Check className="w-4 h-4" /> Simpan Perubahan</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Tambah Operator</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" /> Batal
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── User Table ── */}
        <section
          id="user-table-section"
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          {/* Header + Search */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Daftar Pengguna</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isLoading ? 'Memuat data…' : `${filtered.length} pengguna ditemukan`}
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="user-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pengguna..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="px-6 py-16 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
              <p className="text-sm font-medium text-slate-500">Memuat daftar pengguna…</p>
            </div>
          )}

          {/* Desktop table */}
          {!isLoading && filtered.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-center px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, i) => {
                    const role = ROLE_THEME[user.role] || ROLE_THEME.user;
                    const RoleIcon = role.icon;
                    const isAdmin = user.role === 'admin';
                    return (
                      <tr
                        key={user.id}
                        className={`border-b border-slate-50 hover:bg-blue-50/40 transition-colors ${
                          i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                      >
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-slate-900">{user.name}</p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{user.email}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${role.bg} ${role.text}`}
                          >
                            <RoleIcon className="w-3.5 h-3.5" />
                            {role.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          {isAdmin ? (
                            <span className="text-xs text-slate-400 font-medium">—</span>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => startEdit(user)}
                                className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setShowDeleteModal(user.id)}
                                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile card list */}
          {!isLoading && filtered.length > 0 && (
            <div className="md:hidden divide-y divide-slate-100">
              {filtered.map((user) => {
                const role = ROLE_THEME[user.role] || ROLE_THEME.user;
                const RoleIcon = role.icon;
                const isAdmin = user.role === 'admin';
                return (
                  <div key={user.id} className="px-5 py-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                      {!isAdmin && (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => startEdit(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(user.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${role.bg} ${role.text}`}
                      >
                        <RoleIcon className="w-3 h-3" />
                        {role.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">
                Tidak ada pengguna ditemukan
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Coba ubah kata kunci pencarian
              </p>
            </div>
          )}
        </section>
      </main>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Pengguna?</h3>
                <p className="text-xs text-slate-500">Aksi ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => confirmDelete(showDeleteModal)}
                id="confirm-delete-user-btn"
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 transition-all cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
