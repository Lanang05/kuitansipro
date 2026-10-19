import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { supabase } from '../lib/supabase';
import { formatRupiah, formatDateIndo } from '../lib/utils';
import { FileSpreadsheet } from 'lucide-react';

export const Reports: React.FC = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    const { data } = await supabase.from('receipts').select('*').order('date', { ascending: false });
    if (data) setReceipts(data);
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (receipts.length === 0) return;

    const headers = ['Nomor Kuitansi', 'Tanggal', 'Pelanggan', 'Total Tagihan', 'Pembayaran Diterima', 'Status', 'Metode Pembayaran'];
    const rows = receipts.map((r) => [
      `"${r.receipt_number}"`,
      `"${r.date}"`,
      `"${r.customer_name_snap.replace(/"/g, '""')}"`,
      r.total,
      r.paid_amount,
      `"${r.status}"`,
      `"${r.payment_method}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_KuitansiPro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const grandTotal = receipts.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
  const paidTotal = receipts.reduce((acc, r) => acc + (Number(r.paid_amount) || 0), 0);

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laporan Keuangan & Transaksi</h1>
          <p className="text-sm text-slate-500 mt-1">Ekspor ringkasan transaksi ke format CSV / Excel</p>
        </div>
        <button
          onClick={handleExportCSV}
          data-testid="btn-export-csv"
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4"/>
          <span>Ekspor CSV (Excel)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Akumulasi Omset Total</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(grandTotal)}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Kas Diterima</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{formatRupiah(paidTotal)}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">No. Kuitansi</th>
                <th className="px-6 py-3.5">Tanggal</th>
                <th className="px-6 py-3.5">Pelanggan</th>
                <th className="px-6 py-3.5">Total Tagihan</th>
                <th className="px-6 py-3.5">Diterima</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Memuat laporan...</td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Belum ada transaksi</td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-4 font-semibold text-slate-900">{r.receipt_number}</td>
                    <td className="px-6 py-4 text-xs">{formatDateIndo(r.date)}</td>
                    <td className="px-6 py-4">{r.customer_name_snap}</td>
                    <td className="px-6 py-4 font-bold">{formatRupiah(r.total)}</td>
                    <td className="px-6 py-4 text-emerald-600">{formatRupiah(r.paid_amount)}</td>
                    <td className="px-6 py-4 text-xs font-semibold">{r.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};
