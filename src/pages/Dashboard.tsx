import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { supabase } from '../lib/supabase';
import { formatRupiah, formatDateIndo } from '../lib/utils';
import { StatusBadge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { FileText, DollarSign, CheckCircle2, Clock, PlusCircle, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    paidCount: 0,
    unpaidCount: 0,
  });
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const { data: receipts } = await supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false });

    if (receipts) {
      let totalAmount = 0;
      let paidAmount = 0;
      let unpaidAmount = 0;
      let paidCount = 0;
      let unpaidCount = 0;

      receipts.forEach((r) => {
        if (r.status !== 'CANCELLED') {
          totalAmount += Number(r.total) || 0;
          paidAmount += Number(r.paid_amount) || 0;
          unpaidAmount += Math.max(0, (Number(r.total) || 0) - (Number(r.paid_amount) || 0));

          if (r.status === 'PAID') paidCount++;
          if (['UNPAID', 'PARTIAL', 'OVERDUE'].includes(r.status)) unpaidCount++;
        }
      });

      setStats({
        totalReceipts: receipts.length,
        totalAmount,
        paidAmount,
        unpaidAmount,
        paidCount,
        unpaidCount,
      });

      setRecentReceipts(receipts.slice(0, 5));
    }
    setLoading(false);
  };

  const chartData = [
    { name: 'Total Transaksi', Rp: stats.totalAmount },
    { name: 'Diterima', Rp: stats.paidAmount },
    { name: 'Sisa Tagihan', Rp: stats.unpaidAmount },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Ringkasan</h1>
          <p className="text-sm text-slate-500 mt-1">Pantau performa penerimaan pembayaran usaha Anda</p>
        </div>
        <Link
          to="/receipts/new"
          data-testid="btn-create-receipt-dashboard"
          className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Kuitansi Baru</span>
        </Link>
      </div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kuitansi</span>
            <div className="p-2 bg-blue-50 text-brand-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{loading ? '...' : stats.totalReceipts}</div>
          <div className="text-xs text-slate-400 mt-1">{stats.paidCount} lunas / {stats.unpaidCount} belum lunas</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Transaksi</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{loading ? '...' : formatRupiah(stats.totalAmount)}</div>
          <div className="text-xs text-slate-400 mt-1">Nilai bruto seluruh kuitansi</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pembayaran Diterima</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{loading ? '...' : formatRupiah(stats.paidAmount)}</div>
          <div className="text-xs text-emerald-700/60 mt-1">Dana masuk terverifikasi</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sisa Tagihan</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{loading ? '...' : formatRupiah(stats.unpaidAmount)}</div>
          <div className="text-xs text-amber-700/60 mt-1">Piutang belum tertagih</div>
        </div>
      </div>

      {/* Area Grafik & Transaksi Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-base mb-4">Grafik Perbandingan Keuangan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(val: any) => formatRupiah(Number(val))} />
                <Bar dataKey="Rp" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base">Kuitansi Terbaru</h3>
            <Link to="/receipts" className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-medium">
              <span>Lihat Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentReceipts.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">Belum ada transaksi</p>
            ) : (
              recentReceipts.map((r) => (
                <Link
                  key={r.id}
                  to={`/receipts/${r.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div>
                    <div className="font-semibold text-slate-800 text-xs">{r.receipt_number}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{r.customer_name_snap}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">{formatRupiah(r.total)}</div>
                    <div className="mt-1">
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
