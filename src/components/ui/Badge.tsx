import React from 'react';
import { ReceiptStatus } from '../../types/database';

interface BadgeProps {
  status: ReceiptStatus;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  const config: Record<ReceiptStatus, { label: string; bg: string; text: string }> = {
    DRAFT: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700' },
    UNPAID: { label: 'Belum Dibayar', bg: 'bg-amber-100', text: 'text-amber-800' },
    PARTIAL: { label: 'Dibayar Sebagian', bg: 'bg-blue-100', text: 'text-blue-800' },
    PAID: { label: 'Lunas', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    OVERDUE: { label: 'Jatuh Tempo', bg: 'bg-rose-100', text: 'text-rose-800' },
    CANCELLED: { label: 'Dibatalkan', bg: 'bg-gray-200', text: 'text-gray-600' },
  };

  const current = config[status] || config.DRAFT;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${current.bg} ${current.text}`}>
      {current.label}
    </span>
  );
};
