export interface Category {
  id: string;
  name: string;
}

export interface CatalogPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  price_final: number;
  package_category: Category | null;
}

export interface CatalogAddon {
  id: string;
  name: string;
  price: number;
}

export interface Catalog {
  categories: Category[];
  packages: CatalogPackage[];
  addons: CatalogAddon[];
}

export interface OrderEvent {
  id: string;
  note: string;
  date: string;
  location: string;
}

export interface OrderDetail {
  package: { id: string; name: string; description: string; category: string } | null;
  quantity: number;
  amount: number;
  invoice_detail_addons: { quantity: number; amount: number; package_addon?: { id: string; name: string } | null }[];
  events?: OrderEvent[];
}

export type TransactionStatus = "unpaid" | "down_payment" | "paid";

export type CancelStatus = "requested" | "approved" | "rejected" | null;
export interface CancelInfo {
  status: CancelStatus;
  reason: string | null;
  requested_at: string | null;
  reviewed_at: string | null;
  admin_note: string | null;
  can_request: boolean;
}

export interface Order {
  cancel?: CancelInfo;
  customer?: { name: string | null; whatsapp: string; address?: string | null } | null;
  id: string;
  invoice_number: string;
  transaction_status: TransactionStatus;
  total_price: number;
  amount_paid: number;
  remaining_paid: number;
  created_at: string;
  invoice_details: OrderDetail[];
  payments?: { id: string; amount: number; paid_at: string; method: string; note: string | null }[];
}

export interface BookingPayload {
  name: string;
  email?: string;
  address?: string;
  packages: {
    id: string;
    quantity: number;
    date: string;
    location: string;
    note?: string;
    package_addons?: { id: string; quantity: number }[];
  }[];
}
