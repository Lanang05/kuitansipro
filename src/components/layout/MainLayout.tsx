import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { supabase } from '../../lib/supabase';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
      }
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between no-print sticky top-0 z-10 shadow-sm">
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">KuitansiPro Workspace</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700 font-medium">{userEmail || 'Administrator'}</span>
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-sm border border-brand-200">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
