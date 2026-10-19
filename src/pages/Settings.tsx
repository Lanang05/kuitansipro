import React from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { Settings as SettingsIcon, ShieldCheck, Database, Globe } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>
          <p className="text-sm text-slate-500 mt-1">Konfigurasi preferensi aplikasi dan integrasi database</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="p-2.5 bg-brand-100 text-brand-700 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Mata Uang & Zona Waktu</h3>
              <p className="text-xs text-slate-500 mt-0.5">Mata Uang Default: Rupiah Indonesia (IDR)</p>
              <p className="text-xs text-slate-500">Zona Waktu: Asia/Jakarta (WIB)</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Keamanan & Otorisasi Data</h3>
              <p className="text-xs text-slate-500 mt-0.5">Row Level Security (RLS) Aktif di PostgreSQL</p>
              <p className="text-xs text-slate-500">Setiap pengguna mengisolasi data usahanya secara terpisah.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Database Provider</h3>
              <p className="text-xs text-slate-500 mt-0.5">Supabase PostgreSQL 15</p>
              <p className="text-xs text-slate-500">Real-time sync dan pendaftaran aman.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
