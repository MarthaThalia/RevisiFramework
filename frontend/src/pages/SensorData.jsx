import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Thermometer,
  Droplets,
  Wind,
  FlaskConical,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Play,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import useSensorStore from '../store/sensorStore';

/* ──────────────────────────────────────────────
   Parameter config for the form fields
   (keys match the API contract: temperature, ph, do, nh3)
   ────────────────────────────────────────────── */
const PARAMS = [
  { key: 'temperature', label: 'Suhu', unit: '°C', icon: Thermometer, color: 'text-orange-600', step: '0.1', min: 0, max: 45 },
  { key: 'ph', label: 'pH', unit: '', icon: Droplets, color: 'text-blue-600', step: '0.1', min: 0, max: 14 },
  { key: 'do', label: 'DO', unit: 'mg/L', icon: Wind, color: 'text-teal-600', step: '0.1', min: 0, max: 20 },
  { key: 'nh3', label: 'NH3', unit: 'mg/L', icon: FlaskConical, color: 'text-violet-600', step: '0.01', min: 0, max: 5 },
];

const EMPTY_FORM = { temperature: '', ph: '', do: '', nh3: '' };

/* ──────────────────────────────────────────────
   Helper: format ISO timestamp → readable
   ────────────────────────────────────────────── */
function formatTimestamp(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleString('id-ID', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

/* ──────────────────────────────────────────────
   Helper: Get dynamic color classes for condition badge
   ────────────────────────────────────────────── */
function getConditionBadgeClass(condition) {
  if (!condition) return 'bg-slate-100 text-slate-800';
  const name = condition.toLowerCase().trim();
  if (name.includes('optimal') || name.includes('aman') || name.includes('baik') || name.includes('sehat')) {
    return 'bg-emerald-100 text-emerald-800';
  }
  if (name.includes('siaga') || name.includes('waspada') || name.includes('peringatan') || name.includes('hati-hati') || name.includes('cukup')) {
    return 'bg-amber-100 text-amber-800';
  }
  if (name.includes('kritis') || name.includes('bahaya') || name.includes('buruk')) {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-slate-100 text-slate-800';
}

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
export default function SensorData() {
  const navigate = useNavigate();
  const {
    readings,
    isLoading,
    error,
    fetchReadings,
    addReading,
    updateReading,
    deleteReading,
    clearError,
    setSelectedReadingId,
  } = useSensorStore();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCondition, setFilterCondition] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch real data from the database on mount
  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  // Reset to page 1 on search/filter/pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCondition, pageSize, sortBy, sortOrder]);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  /* ── Form handlers with validation ── */
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    const param = PARAMS.find((p) => p.key === key);
    if (param) {
      if (value.trim() === '') {
        setValidationErrors((prev) => ({ ...prev, [key]: `${param.label} wajib diisi` }));
      } else {
        const num = parseFloat(value);
        if (isNaN(num)) {
          setValidationErrors((prev) => ({ ...prev, [key]: `${param.label} harus berupa angka` }));
        } else if (num < param.min || num > param.max) {
          setValidationErrors((prev) => ({
            ...prev,
            [key]: `${param.label} harus di antara ${param.min} dan ${param.max}${param.unit ? ' ' + param.unit : ''}`,
          }));
        } else {
          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation check
    const errors = {};
    PARAMS.forEach((param) => {
      const val = form[param.key];
      if (val === '') {
        errors[param.key] = `${param.label} wajib diisi`;
      } else {
        const num = parseFloat(val);
        if (isNaN(num)) {
          errors[param.key] = `${param.label} harus berupa angka`;
        } else if (num < param.min || num > param.max) {
          errors[param.key] = `${param.label} harus di antara ${param.min} dan ${param.max}${param.unit ? ' ' + param.unit : ''}`;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      pond_id: 1, // default pond per API contract
      temperature: +form.temperature,
      ph: +form.ph,
      do: +form.do,
      nh3: +form.nh3,
    };

    if (editingId !== null) {
      // Update existing — API first, then state
      const result = await updateReading(editingId, payload);
      if (result) {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setValidationErrors({});
        showSuccess('Data sensor berhasil diperbarui!');
      }
    } else {
      // Add new — API first, then state
      const result = await addReading(payload);
      if (result) {
        setForm(EMPTY_FORM);
        setValidationErrors({});
        showSuccess('Data sensor baru berhasil disimpan!');
      }
    }
    setIsSubmitting(false);
  };

  const startEdit = (record) => {
    setEditingId(record.id);
    setForm({
      temperature: String(record.temperature),
      ph: String(record.ph),
      do: String(record.do),
      nh3: String(record.nh3),
    });
    setValidationErrors({});
    // Scroll to form on mobile
    document.getElementById('sensor-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setValidationErrors({});
  };

  const confirmDelete = async (id) => {
    const success = await deleteReading(id);
    if (success) {
      setShowDeleteModal(null);
      showSuccess('Data sensor berhasil dihapus!');
    }
  };

  const handleGenerate = (row) => {
    setSelectedReadingId(row.id);
    showSuccess('Mengambil data historis... Menjalankan proses klasifikasi.');
    setTimeout(() => {
      navigate('/klasifikasi');
    }, 800);
  };

  const isFormValid =
    form.temperature !== '' &&
    form.ph !== '' &&
    form.do !== '' &&
    form.nh3 !== '' &&
    Object.keys(validationErrors).length === 0;

  // Display records in chronological or reverse chronological order based on state
  const displayRecords = [...readings].reverse();

  // Extract unique water conditions from readings for dynamic filter dropdown
  const uniqueConditions = Array.from(
    new Set(
      readings
        .map((r) => r.water_condition)
        .filter(Boolean)
    )
  );

  // Filter records based on search query and water condition filter
  const filteredRecords = displayRecords.filter((row) => {
    const formattedDate = formatTimestamp(row.created_at).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      formattedDate.includes(query) ||
      String(row.temperature).includes(query) ||
      String(row.ph).includes(query) ||
      String(row.do).includes(query) ||
      String(row.nh3).includes(query) ||
      (row.water_condition && row.water_condition.toLowerCase().includes(query));

    const matchesCondition = filterCondition === '' || row.water_condition === filterCondition;

    return matchesSearch && matchesCondition;
  });

  // Sort records
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'created_at') {
      valA = new Date(a.created_at).getTime();
      valB = new Date(b.created_at).getTime();
    } else if (sortBy === 'water_condition') {
      valA = a.water_condition || '';
      valB = b.water_condition || '';
    } else {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate pagination variables
  const totalItems = sortedRecords.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecords = sortedRecords.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Data Sensor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Input dan kelola data pembacaan sensor kualitas air
          </p>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <ErrorBanner
            message={error}
            onRetry={fetchReadings}
            onDismiss={clearError}
          />
        )}

        {/* ── Success Banner ── */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
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

        {/* ── Input Form ── */}
        <section
          id="sensor-form"
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            {editingId ? 'Edit Data Sensor' : 'Input Data Baru'}
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            {editingId
              ? 'Ubah nilai parameter sensor di bawah ini'
              : 'Masukkan hasil pembacaan sensor kolam bioflok'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {PARAMS.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.key}>
                    <label
                      htmlFor={`input-${p.key}`}
                      className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mb-1.5"
                    >
                      <Icon className={`w-4 h-4 ${p.color}`} />
                      {p.label}
                      {p.unit && (
                        <span className="text-xs font-normal text-slate-400">
                          ({p.unit})
                        </span>
                      )}
                    </label>
                    <input
                      id={`input-${p.key}`}
                      type="number"
                      step={p.step}
                      min={p.min}
                      max={p.max}
                      value={form[p.key]}
                      onChange={(e) => handleChange(p.key, e.target.value)}
                      placeholder={`Masukkan ${p.label}`}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-blue-500 transition-all text-sm ${
                        validationErrors[p.key]
                          ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                          : 'border-slate-200 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {validationErrors[p.key] && (
                      <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {validationErrors[p.key]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                id="sensor-submit-btn"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan…
                  </>
                ) : editingId ? (
                  <>
                    <Check className="w-4 h-4" /> Simpan Perubahan
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Tambah Data
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-medium text-sm rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" /> Batal
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ── Data Table ── */}
        <section
          id="sensor-table-section"
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Riwayat Data Sensor</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isLoading ? 'Memuat data…' : `Menampilkan ${filteredRecords.length} dari ${readings.length} data pembacaan sensor`}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-48 md:w-56">
                <input
                  type="text"
                  placeholder="Cari data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Filter condition select */}
              <div className="w-full sm:w-36">
                <select
                  value={filterCondition}
                  onChange={(e) => setFilterCondition(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 text-slate-700 cursor-pointer"
                >
                  <option value="">Semua Kondisi</option>
                  {uniqueConditions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort field select */}
              <div className="w-full sm:w-36">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 text-slate-700 cursor-pointer"
                >
                  <option value="created_at">Sortir: Waktu</option>
                  <option value="temperature">Sortir: Suhu</option>
                  <option value="ph">Sortir: pH</option>
                  <option value="do">Sortir: DO</option>
                  <option value="nh3">Sortir: NH3</option>
                  <option value="water_condition">Sortir: Kondisi</option>
                </select>
              </div>

              {/* Sort order select */}
              <div className="w-full sm:w-36">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 text-slate-700 cursor-pointer"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading skeleton */}
          {isLoading && readings.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
              <p className="text-sm font-medium text-slate-500">Memuat data sensor…</p>
            </div>
          )}

          {/* Desktop table */}
          {!isLoading && paginatedRecords.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Suhu (°C)
                      </span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-blue-500" /> pH
                      </span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-teal-500" /> DO (mg/L)
                      </span>
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1">
                        <FlaskConical className="w-3.5 h-3.5 text-violet-500" /> NH3 (mg/L)
                      </span>
                    </th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Kondisi Air
                    </th>
                    <th className="text-center px-6 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-50 hover:bg-blue-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                    >
                      <td className="px-6 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                        {formatTimestamp(row.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-900">
                        {row.temperature}
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-900">
                        {row.ph}
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-900">
                        {row.do}
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-900">
                        {row.nh3}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getConditionBadgeClass(row.water_condition)}`}>
                          {row.water_condition || 'Tidak Diketahui'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleGenerate(row)}
                            className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                            title="Generate Prediksi"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => startEdit(row)}
                            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(row.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile card list */}
          {!isLoading && paginatedRecords.length > 0 && (
            <div className="md:hidden divide-y divide-slate-100">
              {paginatedRecords.map((row) => (
                <div key={row.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500">
                      {formatTimestamp(row.created_at)}
                    </span>
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleGenerate(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                        title="Generate"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => startEdit(row)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(row.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Suhu</p>
                        <p className="text-sm font-bold text-slate-900">{row.temperature}°C</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">pH</p>
                        <p className="text-sm font-bold text-slate-900">{row.ph}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-teal-500" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">DO</p>
                        <p className="text-sm font-bold text-slate-900">{row.do} mg/L</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-violet-500" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">NH3</p>
                        <p className="text-sm font-bold text-slate-900">{row.nh3} mg/L</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getConditionBadgeClass(row.water_condition)}`}>
                      Kondisi: {row.water_condition || 'Tidak Diketahui'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filteredRecords.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">
                Data sensor tidak ditemukan
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Coba sesuaikan kata kunci pencarian atau filter kondisi air Anda
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && filteredRecords.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span>Tampilkan</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>data per halaman</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Sebelumnya
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
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
                <h3 className="text-base font-bold text-slate-900">Hapus Data?</h3>
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
                id="confirm-delete-btn"
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
