import { Link } from 'react-router-dom';
import {
  Droplets,
  Thermometer,
  Wind,
  FlaskConical,
  Activity,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Waves,
  Fish,
  Cpu,
  CloudLightning,
} from 'lucide-react';
import heroImg from '../assets/hero-bioflok.png';

/* ──────────────────────────────────────────────
   Feature cards config
   ────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Thermometer,
    title: 'Monitoring Suhu',
    desc: 'Pantau suhu kolam bioflok secara real-time dengan sensor IoT presisi tinggi.',
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
  },
  {
    icon: Droplets,
    title: 'Pengukuran pH',
    desc: 'Lacak tingkat keasaman air untuk memastikan lingkungan optimal bagi ikan.',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Wind,
    title: 'Dissolved Oxygen',
    desc: 'Monitor kadar oksigen terlarut yang vital untuk kelangsungan hidup bioflok.',
    gradient: 'from-teal-500 to-emerald-500',
    bg: 'bg-teal-50',
  },
  {
    icon: FlaskConical,
    title: 'Deteksi Ammonia',
    desc: 'Deteksi dini kadar NH3 berbahaya untuk mencegah kematian massal ikan.',
    gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
  },
  {
    icon: BarChart3,
    title: 'Klasifikasi Otomatis',
    desc: 'Sistem DSS mengklasifikasikan kualitas air secara otomatis dengan algoritma cerdas.',
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
  },
  {
    icon: Shield,
    title: 'Peringatan Dini',
    desc: 'Dapatkan notifikasi instan saat parameter air melewati ambang batas aman.',
    gradient: 'from-sky-500 to-indigo-500',
    bg: 'bg-sky-50',
  },
];

/* ──────────────────────────────────────────────
   How it works steps
   ────────────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    icon: Cpu,
    title: 'Pemasangan Sensor',
    desc: 'Pasang sensor IoT di kolam bioflok Anda untuk mulai mengumpulkan data.',
  },
  {
    num: '02',
    icon: CloudLightning,
    title: 'Pengumpulan Data',
    desc: 'Data sensor dikirim secara otomatis ke cloud untuk diproses dan dianalisis.',
  },
  {
    num: '03',
    icon: Activity,
    title: 'Monitoring & Analisis',
    desc: 'Pantau dashboard real-time dan dapatkan rekomendasi dari sistem DSS.',
  },
];

/* ──────────────────────────────────────────────
   Stats
   ────────────────────────────────────────────── */
const STATS = [
  { value: '4+', label: 'Parameter Termonitor' },
  { value: '24/7', label: 'Monitoring Real-time' },
  { value: '99%', label: 'Akurasi Sensor' },
  { value: '<1s', label: 'Response Time' },
];

/* ──────────────────────────────────────────────
   Landing Page Component
   ────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 flex justify-center pt-4 pb-2 px-4">
        <nav
          id="landing-navbar"
          className="flex items-center gap-6 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-100 px-6 py-2.5"
        >
          <div className="flex items-center gap-2 mr-4">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-800 tracking-tight">
              Bioflok Monitor
            </span>
          </div>

          <a
            href="#features"
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors hidden sm:block"
          >
            Fitur
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors hidden sm:block"
          >
            Cara Kerja
          </a>
          <a
            href="#stats"
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors hidden sm:block"
          >
            Statistik
          </a>

          <div className="flex items-center gap-2 ml-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 px-4 py-1.5 rounded-full transition-all shadow-sm hover:shadow-md"
            >
              Daftar
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero Section ── */}
      <section id="hero-section" className="relative pt-12 pb-20 px-4">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/3 -translate-y-1/3 animate-pulse" />
        <div className="absolute top-20 right-0 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-25 translate-x-1/4 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-6">
                <Waves className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Living Lab FTK - Undiksha
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Monitoring{' '}
                <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                  Kualitas Air
                </span>{' '}
                Bioflok Cerdas
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                Sistem pendukung keputusan berbasis IoT untuk monitoring dan klasifikasi
                kualitas air kolam bioflok secara real-time. Tingkatkan produktivitas
                budidaya ikan Anda dengan teknologi cerdas.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/login"
                  id="hero-cta-primary"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-teal-600 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl text-base"
                >
                  <Fish className="w-5 h-5" />
                  Mulai Gratis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  id="hero-cta-secondary"
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-semibold px-8 py-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm text-base"
                >
                  Masuk ke Dashboard
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right — Hero Image */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md lg:max-w-lg">
                {/* Glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-3xl blur-2xl scale-105" />
                <img
                  src={heroImg}
                  alt="Bioflok Monitoring System"
                  className="relative z-10 w-full h-auto rounded-3xl shadow-2xl border border-white/50"
                />
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 z-20 bg-white rounded-2xl shadow-lg border border-slate-100 px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Real-time</p>
                    <p className="text-[11px] text-slate-500">Data diperbarui setiap detik</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section id="stats" className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl px-8 py-10 shadow-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-sm text-blue-100 font-medium mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 mb-4">
              <Activity className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">
                Fitur Unggulan
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Semua yang Anda Butuhkan
            </h2>
            <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Sistem monitoring lengkap dengan sensor IoT dan algoritma klasifikasi
              untuk membantu Anda mengelola kolam bioflok dengan lebih efisien.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className={`group ${feat.bg} border border-white/60 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default`}
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${feat.gradient} rounded-xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 mb-4">
              <Zap className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                Cara Kerja
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Mulai dalam 3 Langkah
            </h2>
            <p className="text-base text-slate-500 max-w-xl mx-auto">
              Dari pemasangan sensor hingga monitoring real-time — semuanya mudah dan cepat.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative text-center group">
                  {/* Connector line (desktop) */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-300 to-teal-300" />
                  )}

                  <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-teal-50 border-2 border-blue-200 rounded-2xl mb-5 group-hover:border-blue-400 group-hover:shadow-md transition-all">
                    <Icon className="w-8 h-8 text-blue-600" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section id="cta-section" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl px-8 py-16 shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Droplets className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Siap Meningkatkan Produktivitas?
              </h2>
              <p className="text-base text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
                Bergabunglah sekarang dan mulai monitoring kualitas air kolam bioflok
                Anda dengan sistem cerdas berbasis IoT.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-teal-500 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
                >
                  Daftar Sekarang
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/20 active:scale-[0.98] transition-all backdrop-blur-sm"
                >
                  Sudah Punya Akun?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-4 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-700">Bioflok Monitor</span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Living Lab FTK — Universitas Pendidikan Ganesha. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
              Kebijakan Privasi
            </a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
              Syarat & Ketentuan
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
