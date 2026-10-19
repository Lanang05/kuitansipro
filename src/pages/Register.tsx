import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Receipt } from 'lucide-react';

export const Register: React.FC = () => {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      alert('Pendaftaran berhasil! Silakan masuk.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-brand-600 text-white p-3 rounded-2xl mb-3 shadow-lg shadow-brand-900/30">
            <Receipt className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Buat Akun KuitansiPro</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar usaha Anda dalam beberapa detik</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Nama Usaha / Perusahaan</label>
            <input
              type="text"
              required
              data-testid="input-business-name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="PT Contoh Digital"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Email</label>
            <input
              type="email"
              required
              data-testid="input-register-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@usaha.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Kata Sandi</label>
            <input
              type="password"
              required
              data-testid="input-register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              minLength={6}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="btn-submit-register"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition duration-150 flex items-center justify-center gap-2 shadow-md shadow-brand-600/30 disabled:opacity-50 mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Mendaftar...' : 'Daftar Akun'}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
};
