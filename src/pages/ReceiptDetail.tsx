import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { supabase } from '../lib/supabase';
import { formatRupiah, formatDateIndo, numberToTerbilang } from '../lib/utils';
import { StatusBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Printer, Download, ArrowLeft, PlusCircle, Building2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ReceiptDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Modal Pembayaran
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('TRANSFER');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    const { data: r } = await supabase
      .from('receipts')
      .select('*, receipt_items(*)')
      .eq('id', id)
      .single();

    if (r) {
      setReceipt(r);
      const remaining = Math.max(0, r.total - r.paid_amount);
      setPaymentAmount(remaining);

      // Fetch Profile Usaha
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', r.user_id).single();
      if (prof) setProfile(prof);

      // Fetch Payments History
      const { data: pmts } = await supabase.from('payments').select('*').eq('receipt_id', r.id).order('payment_date', { ascending: false });
      if (pmts) setPayments(pmts);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-receipt');
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${receipt.receipt_number}.pdf`);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    const newPaidTotal = Number(receipt.paid_amount) + Number(paymentAmount);
    let newStatus = receipt.status;
    if (newPaidTotal >= receipt.total) {
      newStatus = 'PAID';
    } else {
      newStatus = 'PARTIAL';
    }

    // Insert payment record
    await supabase.from('payments').insert([
      {
        receipt_id: receipt.id,
        amount: paymentAmount,
        payment_method: paymentMethod,
        notes: paymentNotes || 'Pembayaran Lanjutan',
      },
    ]);

    // Update receipt paid_amount and status
    await supabase
      .from('receipts')
      .update({
        paid_amount: newPaidTotal,
        status: newStatus,
      })
      .eq('id', receipt.id);

    setIsPaymentModalOpen(false);
    fetchDetail();
  };

  if (loading) return <MainLayout><div className="py-12 text-center text-slate-400">Memuat detail kuitansi...</div></MainLayout>;
  if (!receipt) return <MainLayout><div className="py-12 text-center text-rose-500">Kuitansi tidak ditemukan.</div></MainLayout>;

  const remainingBalance = Math.max(0, receipt.total - receipt.paid_amount);

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/receipts')} className="p-2 hover:bg-slate-200 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{receipt.receipt_number}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={receipt.status} />
              <span className="text-xs text-slate-400">• Diterbitkan {formatDateIndo(receipt.date)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {remainingBalance > 0 && receipt.status !== 'CANCELLED' && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              data-testid="btn-record-payment"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Pembayaran</span>
            </button>
          )}
          <button
            onClick={handlePrint}
            data-testid="btn-print"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            data-testid="btn-download-pdf"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* TAMPILAN TEMPLATE KUITANSI RESMI */}
      <div className="bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-lg max-w-4xl mx-auto" id="printable-receipt">
        {/* Header Usaha & Kuitansi */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{profile?.business_name || 'KUITANSI DIGITAL'}</h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xs whitespace-pre-line">{profile?.address || 'Alamat Perusahaan'}</p>
            <p className="text-xs text-slate-600 mt-0.5">Telp: {profile?.phone || '-'} | Email: {profile?.email || '-'}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-brand-900 tracking-wider">KUITANSI</span>
            <div className="text-sm font-bold text-slate-800 mt-1">NO: {receipt.receipt_number}</div>
            <div className="text-xs text-slate-500 mt-0.5">Tanggal: {formatDateIndo(receipt.date)}</div>
          </div>
        </div>

        {/* Pelanggan */}
        <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg mb-6 border border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diterima Dari</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">{receipt.customer_name_snap}</div>
            <div className="text-xs text-slate-600 mt-1">{receipt.customer_address_snap || '-'}</div>
            <div className="text-xs text-slate-600">{receipt.customer_phone_snap}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Metode Pembayaran</span>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">{receipt.payment_method}</div>
            {receipt.due_date && (
              <div className="text-xs text-rose-600 mt-2 font-medium">Jatuh Tempo: {formatDateIndo(receipt.due_date)}</div>
            )}
          </div>
        </div>

        {/* Tabel Items */}
        <table className="w-full text-left text-xs text-slate-700 mb-6">
          <thead>
            <tr className="border-b-2 border-slate-300 bg-slate-100 font-bold uppercase text-slate-600">
              <th className="py-2.5 px-3">No</th>
              <th className="py-2.5 px-3">Deskripsi Produk / Jasa</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Harga Satuan</th>
              <th className="py-2.5 px-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {receipt.receipt_items?.map((item: any, idx: number) => (
              <tr key={idx}>
                <td className="py-3 px-3">{idx + 1}</td>
                <td className="py-3 px-3 font-medium text-slate-900">{item.product_name}</td>
                <td className="py-3 px-3 text-center">{item.quantity} {item.unit}</td>
                <td className="py-3 px-3 text-right">{formatRupiah(item.price)}</td>
                <td className="py-3 px-3 text-right font-semibold">{formatRupiah(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total & Terbilang */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start border-t border-slate-200 pt-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Terbilang</span>
            <div className="text-xs font-bold text-slate-800 italic mt-1">"# {numberToTerbilang(receipt.total)} #"</div>
          </div>

          <div className="space-y-1.5 text-xs text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatRupiah(receipt.subtotal)}</span>
            </div>
            {receipt.discount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Diskon:</span>
                <span className="font-semibold text-rose-600">-{formatRupiah(receipt.discount)}</span>
              </div>
            )}
            {receipt.tax_amount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Pajak:</span>
                <span className="font-semibold">{formatRupiah(receipt.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-300 pt-2">
              <span>Total Tagihan:</span>
              <span className="text-brand-900">{formatRupiah(receipt.total)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Sudah Dibayar:</span>
              <span>{formatRupiah(receipt.paid_amount)}</span>
            </div>
            <div className="flex justify-between text-amber-700 font-bold border-t border-dashed border-slate-200 pt-1">
              <span>Sisa Tagihan:</span>
              <span>{formatRupiah(remainingBalance)}</span>
            </div>
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-8 mt-12 text-center text-xs text-slate-600">
          <div>
            <p>Penerima / Pembayar,</p>
            <div className="h-16"></div>
            <p className="font-bold border-b border-slate-300 inline-block px-8">{receipt.customer_name_snap}</p>
          </div>
          <div>
            <p>Hormat Kami,</p>
            <div className="h-16"></div>
            <p className="font-bold border-b border-slate-300 inline-block px-8">{receipt.recipient_name || profile?.owner_name || 'Kasir / Admin'}</p>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
          {profile?.receipt_footer_text || 'Terima kasih atas pembayaran Anda.'}
        </div>
      </div>

      {/* Modal Tambah Pembayaran */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Catat Pembayaran Baru">
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nominal Pembayaran (Rp)</label>
            <input
              type="number"
              max={remainingBalance}
              min="1"
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">Sisa tagihan maksimal: {formatRupiah(remainingBalance)}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Metode Pembayaran</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="TRANSFER">Transfer Bank</option>
              <option value="TUNAI">Tunai / Cash</option>
              <option value="QRIS">QRIS</option>
              <option value="KARTU_KREDIT">Kartu Kredit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Pembayaran</label>
            <textarea
              rows={2}
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Contoh: Cicilan termin kedua via Transfer BCA"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold"
            >
              Simpan Pembayaran
            </button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};
