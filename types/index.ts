export type Customer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  gst_number?: string | null;
  customerType?: "individual" | "business" | "B2B" | "B2C" | null;
  status?: "active" | "inactive" | null;
  totalOrders?: number | null;
  totalAmount?: number | null;
  lastOrderDate?: string | null;
  createdDate?: string | null;
};

export type Product = {
  id: string | number;
  name: string;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  sku?: string | null;
  hsn?: string | null;
  rate: number;
  tax: number;
  stock?: number | null;
  minStock?: number | null;
  costPrice?: number | null;
  sellingPrice?: number | null;
  status?: "active" | "inactive" | null;
  supplier?: string | null;
  barcode?: string | null;
  lastUpdated?: string | null;
  createdAt?: string | null;
}; 

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: Date;
  dueDate: Date;
  items: InvoiceItem[];
}

export interface FormData {
  [key: string]: string | number | boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}