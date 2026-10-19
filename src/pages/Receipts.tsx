import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { supabase } from '../lib/supabase';
import { formatRupiah, formatDateIndo } from '../lib/utils';
import { StatusBadge } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Filter, Eye, Trash2 } from 'lucide-react';
import { ReceiptStatus } from '../types/database';

export const Receipts: React.FC = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setReceipts(data);
    setLoading(false);
  };

  const handleDeleteDraft = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus draft kuitansi ini?')) {
      await supabase.from('receipts').delete().eq('id', id);
      fetchReceipts();
    }
  };

  const filteredReceipts = receipts.filter((r) => {
    const matchSearch =
      r.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_name_snap.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Kuitansi</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dan lacak seluruh dokumen kuitansi digital</p>
        </div>
        <Link
          to="/receipts/new"
          data-testid="btn-create-receipt-page"
          className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Kuitansi Baru</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              data-testid="input-search-receipt"
              placeholder="Cari nomor kuitansi atau nama pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              data-testid="select-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="ALL">Semua Status</option>
              <option value="UNPAID">Belum Dibayar</option>
              <option value="PARTIAL">Dibayar Sebagian</option>
              <option value="PAID">Lunas</option>
              <option value="DRAFT">Draft</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">No. Kuitansi</th>
                <th className="px-6 py-3.5">Tanggal</th>
                <th className="px-6 py-3.5">Pelanggan</th>
                <th className="px-6 py-3.5">Total</th>
                <th className="px-6 py-3.5">Diterima</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Memuat data kuitansi...</td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Tidak ada kuitansi ditemukan</td>
                </tr>
              ) : (
                filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{r.receipt_number}</td>
                    <td className="px-6 py-4 text-xs">{formatDateIndo(r.date)}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{r.customer_name_snap}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatRupiah(r.total)}</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">{formatRupiah(r.paid_amount)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/receipts/${r.id}`}
                          data-testid={`btn-view-${r.id}`}
                          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {r.status === 'DRAFT' && (
                          <button
                            onClick={() => handleDeleteDraft(r.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Draft"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
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
