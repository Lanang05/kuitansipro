import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDateIndo(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  }).format(date);
}

export function calculateReceiptTotals(
  items: { quantity: number; price: number }[],
  discount: number = 0,
  taxPercent: number = 0,
  additionalFee: number = 0
) {
  const subtotal = items.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const prc = Number(item.price) || 0;
    return acc + Math.round(qty * prc);
  }, 0);

  const disc = Number(discount) || 0;
  const taxPct = Number(taxPercent) || 0;
  const addFee = Number(additionalFee) || 0;

  const afterDiscount = Math.max(0, subtotal - disc);
  const taxAmount = Math.round(afterDiscount * (taxPct / 100));
  const total = Math.max(0, afterDiscount + taxAmount + addFee);

  return {
    subtotal,
    taxAmount,
    total
  };
}

export function numberToTerbilang(amount: number): string {
  const angka = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  let n = Math.floor(Math.abs(amount));
  
  if (n === 0) return "Nol Rupiah";
  
  function terbilangHelper(val: number): string {
    if (val < 12) return angka[val];
    if (val < 20) return terbilangHelper(val - 10) + " Belas";
    if (val < 100) return terbilangHelper(Math.floor(val / 10)) + " Puluh " + angka[val % 10];
    if (val < 200) return "Seratus " + terbilangHelper(val - 100);
    if (val < 1000) return terbilangHelper(Math.floor(val / 100)) + " Ratus " + terbilangHelper(val % 100);
    if (val < 2000) return "Seribu " + terbilangHelper(val - 1000);
    if (val < 1000000) return terbilangHelper(Math.floor(val / 1000)) + " Ribu " + terbilangHelper(val % 1000);
    if (val < 1000000000) return terbilangHelper(Math.floor(val / 1000000)) + " Juta " + terbilangHelper(val % 1000000);
    if (val < 1000000000000) return terbilangHelper(Math.floor(val / 1000000000)) + " Miliar " + terbilangHelper(val % 1000000000);
    return "";
  }

  return (terbilangHelper(n).trim() + " Rupiah").replace(/\s+/g, " ");
}
