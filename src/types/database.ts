export type ReceiptStatus = 'DRAFT' | 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Profile {
  id: string;
  business_name: string;
  owner_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  npwp?: string;
  logo_url?: string;
  receipt_footer_text?: string;
  currency: string;
  timezone?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  code?: string;
  name: string;
  description?: string;
  unit: string;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface ReceiptItem {
  id?: string;
  receipt_id?: string;
  product_id?: string;
  product_name: string;
  unit: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Receipt {
  id: string;
  user_id: string;
  receipt_number: string;
  date: string;
  due_date?: string;
  customer_id?: string;
  customer_name_snap: string;
  customer_phone_snap?: string;
  customer_email_snap?: string;
  customer_address_snap?: string;
  subtotal: number;
  discount: number;
  tax_amount: number;
  additional_fee: number;
  total: number;
  paid_amount: number;
  status: ReceiptStatus;
  payment_method: string;
  notes?: string;
  recipient_name?: string;
  created_at: string;
  receipt_items?: ReceiptItem[];
}

export interface Payment {
  id: string;
  receipt_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
}
