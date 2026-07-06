import { NavLink } from 'react-router-dom';
import { Droplets, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';

/**
 * Daftar navigasi dengan permission berdasarkan role.
 * roles: array role yang diizinkan mengakses halaman tersebut.
 */
const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', roles: ['user', 'operator', 'admin'] },
  { to: '/sensor-data', label: 'Data Sensor', roles: ['operator', 'admin'] },
  { to: '/klasifikasi', label: 'Klasifikasi', roles: ['user', 'operator', 'admin'] },
  { to: '/pengguna', label: 'Pengguna', roles: ['admin'] },
];

export default function Navbar() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role || 'user';

  // Filter navigasi berdasarkan role user
  const visibleLinks = NAV_LINKS.filter((link) => link.roles.includes(userRole));

  return (
    <header className="sticky top-0 z-50 flex justify-center pt-4 pb-2 px-4">
      <nav
        id="main-navbar"
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

        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive
                  ? 'font-semibold text-blue-600 border-b-2 border-blue-600 pb-0.5'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 transition-colors ml-4 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </nav>
    </header>
  );
}
