import { Pagination } from "@services/global/pagination/interfaces/pagination.type";

export interface IGetAll {
  data: Invoice[];
  pagination: Pagination;
}

export interface IGet {
  data: Invoice;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_url: string;
  transaction_status: TransactionStatus;
  total_price: number;
  amount_paid: number;
  proof: string;
  customer: Customer;
  remaining_paid: number;
  invoice_details: InvoiceDetail[];
  payments?: Payment[];
  created_at: Date;
  cancel?: {
    status: "requested" | "approved" | "rejected" | null;
    reason: string | null;
    requested_at: string | null;
    reviewed_at: string | null;
    admin_note: string | null;
  };
}

export type PaymentMethod = "transfer" | "cash" | "qris" | "other";

export interface Payment {
  id: string;
  amount: number;
  paid_at: string;
  method: PaymentMethod;
  note: string | null;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  address: string;
}

export interface InvoiceDetail {
  id: string;
  package: Package;
  quantity: number;
  amount: number;
  invoice_detail_addons: InvoiceDetailAddOn[];
  events: Event[];
}

interface InvoiceDetailAddOn {
  id?: string;
  package_addon: PackageAddOn | null;
  quantity: number;
  amount: number;
}

export interface Event {
  id: string;
  note: string;
  date: Date;
  location: string;
}

interface Package {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface PackageAddOn {
  id: string;
  name: string;
  price: number;
}

export type TransactionStatus = "unpaid" | "down_payment" | "paid";
