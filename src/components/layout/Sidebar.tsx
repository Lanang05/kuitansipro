import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Users, 
  Package, 
  BarChart3, 
  Building2, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Kuitansi', path: '/receipts', icon: FileText },
  { name: 'Buat Kuitansi', path: '/receipts/new', icon: PlusCircle },
  { name: 'Pelanggan', path: '/customers', icon: Users },
  { name: 'Produk & Jasa', path: '/products', icon: Package },
  { name: 'Laporan', path: '/reports', icon: BarChart3 },
  { name: 'Profil Usaha', path: '/profile', icon: Building2 },
  { name: 'Pengaturan', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800 no-print">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-brand-600 p-2.5 rounded-xl text-white font-bold text-xl shadow-lg shadow-brand-900/50">
            KP
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none tracking-tight">KuitansiPro</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">Smart Receipt System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              data-testid={`menu-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          data-testid="btn-logout"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};
