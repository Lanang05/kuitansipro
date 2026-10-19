import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { calculateReceiptTotals, formatRupiah } from '../lib/utils';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

export const CreateReceipt: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [receiptNumber, setReceiptNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [items, setItems] = useState([
    { product_id: '', product_name: '', unit: 'PCS', quantity: 1, price: 0, subtotal: 0 },
  ]);

  const [discount, setDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [additionalFee, setAdditionalFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('TUNAI');
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [recipientName, setRecipientName] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    generateReceiptNumber();
    fetchMasterData();
  }, []);

  const generateReceiptNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setReceiptNumber(`KWT-${year}-${randomNum}`);
  };

  const fetchMasterData = async () => {
    const { data: custs } = await supabase.from('customers').select('*').order('name');
    const { data: prods } = await supabase.from('products').select('*').eq('is_active', true).order('name');
    if (custs) setCustomers(custs);
    if (prods) setProducts(prods);
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone || '');
      setCustomerAddress(found.address || '');
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;

    if (field === 'product_id') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        updated[index].product_name = prod.name;
        updated[index].unit = prod.unit;
        updated[index].price = prod.price;
      }
    }

    const qty = Number(updated[index].quantity) || 0;
    const prc = Number(updated[index].price) || 0;
    updated[index].subtotal = Math.round(qty * prc);

    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { product_id: '', product_name: '', unit: 'PCS', quantity: 1, price: 0, subtotal: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const { subtotal, taxAmount, total } = calculateReceiptTotals(items, discount, taxPercent, additionalFee);

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!customerName) {
      alert('Nama pelanggan wajib diisi.');
      return;
    }

    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      alert('Sesi telah berakhir.');
      return;
    }

    let status = 'UNPAID';
    if (isDraft) {
      status = 'DRAFT';
    } else if (paidAmount >= total && total > 0) {
      status = 'PAID';
    } else if (paidAmount > 0) {
      status = 'PARTIAL';
    }

    const receiptPayload = {
      user_id: userData.user.id,
      receipt_number: receiptNumber,
      date,
      due_date: dueDate || null,
      customer_id: selectedCustomerId || null,
      customer_name_snap: customerName,
      customer_phone_snap: customerPhone,
      customer_address_snap: customerAddress,
      subtotal,
      discount,
      tax_amount: taxAmount,
      additional_fee: additionalFee,
      total,
      paid_amount: isDraft ? 0 : paidAmount,
      status,
      payment_method: paymentMethod,
      notes,
      recipient_name: recipientName,
    };

    const { data: createdReceipt, error } = await supabase
      .from('receipts')
      .insert([receiptPayload])
      .select()
      .single();

    if (error) {
      alert(`Gagal menyimpan kuitansi: ${error.message}`);
      setSaving(false);
      return;
    }

    // Insert Items
    const itemsPayload = items.map((item) => ({
      receipt_id: createdReceipt.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      unit: item.unit,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    }));

    await supabase.from('receipt_items').insert(itemsPayload);

    // Insert Initial Payment Record if paid_amount > 0
    if (!isDraft && paidAmount > 0) {
      await supabase.from('payments').insert([
        {
          receipt_id: createdReceipt.id,
          payment_date: date,
          amount: paidAmount,
          payment_method: paymentMethod,
          notes: 'Pembayaran Awal saat Penerbitan Kuitansi',
        },
      ]);
    }

    setSaving(false);
    navigate(`/receipts/${createdReceipt.id}`);
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/receipts')} className="p-2 hover:bg-slate-200 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Buat Kuitansi Baru</h1>
            <p className="text-sm text-slate-500">Isi formulir transaksi penerimaan pembayaran</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Informasi Utama & Pelanggan */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">1. Informasi Transaksi</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Kuitansi</label>
                <input
                  type="text"
                  readOnly
                  value={receiptNumber}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal Penerbitan</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jatuh Tempo (Opsional)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Pilih Pelanggan Terdaftar</label>
              <select
                onChange={(e) => handleSelectCustomer(e.target.value)}
                value={selectedCustomerId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white mb-3"
              >
                <option value="">-- Pilih dari database atau isi manual --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone || 'Tanpa No. HP'})</option>
                ))}
              </select>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pelanggan *</label>
                  <input
                    type="text"
                    required
                    data-testid="input-customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: PT Nusantara Digital"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Telepon</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Items */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800">2. Rincian Produk / Jasa</h3>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-3 items-end p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pilih / Nama Produk</label>
                    <select
                      value={item.product_id}
                      onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white mb-1"
                    >
                      <option value="">-- Manual / Katalog --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({formatRupiah(p.price)})</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Nama / Deskripsi Item"
                      value={item.product_name}
                      onChange={(e) => handleItemChange(idx, 'product_name', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jumlah</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Satuan</label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <div className="w-32">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Harga Satuan</label>
                    <input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                  </div>

                  <div className="w-32 text-right">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subtotal</label>
                    <div className="py-1.5 text-xs font-bold text-slate-900">{formatRupiah(item.subtotal)}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Samping Ringkasan Pembayaran */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">3. Perhitungan Total</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between font-medium text-slate-600">
                <span>Subtotal Item</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-600">Diskon (Rp)</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-32 px-2 py-1 border border-slate-300 rounded text-right text-xs"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-600">Pajak (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-slate-300 rounded text-right text-xs"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-600">Biaya Tambahan (Rp)</span>
                <input
                  type="number"
                  min="0"
                  value={additionalFee}
                  onChange={(e) => setAdditionalFee(Number(e.target.value))}
                  className="w-32 px-2 py-1 border border-slate-300 rounded text-right text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-base text-slate-900">
                <span>Total Tagihan</span>
                <span className="text-brand-600">{formatRupiah(total)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Metode Pembayaran</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="TUNAI">Tunai / Cash</option>
                  <option value="TRANSFER">Transfer Bank</option>
                  <option value="QRIS">QRIS</option>
                  <option value="KARTU_KREDIT">Kartu Kredit/Debit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah Bayar Diterima (Rp)</label>
                <input
                  type="number"
                  min="0"
                  data-testid="input-paid-amount"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Penerima / Kasir</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Contoh: Admin Keuangan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSubmit(false)}
                data-testid="btn-save-receipt"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Terbitkan Kuitansi</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSubmit(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg transition text-xs"
              >
                Simpan sebagai Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
