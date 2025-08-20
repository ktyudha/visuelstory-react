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
  transaction_status: string;
  total_price: number;
  proof: string;
  customer: Customer;
  events: Event[];
  invoice_details: InvoiceDetail[];
  created_at: Date;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Event {
  id: string;
  note: string;
  date: Date;
  location: string;
}

export interface InvoiceDetail {
  id: string;
  package: Package;
  quantity: number;
  amount: number;
  invoice_detail_addons: InvoiceDetailAddOn[];
}

interface InvoiceDetailAddOn {
  id: string;
  package_addon: PackageAddOn;
  quantity: number;
  amount: number;
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
