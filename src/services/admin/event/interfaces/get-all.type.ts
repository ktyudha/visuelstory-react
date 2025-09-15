import { Pagination } from "@services/global/pagination/interfaces/pagination.type";

export interface IGetAll {
  data: Event[];
  pagination: Pagination;
}

export interface IGet {
  data: Event;
}

export interface Event {
  id: string;
  customer: Customer;
  invoice: Invoice;
  invoice_detail: InvoiceDetail;
  note: string;
  date: Date;
  location: string;
}

interface Customer {
  id: string;
  name: string;
}

interface Package {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Invoice {
  id: string;
  number: string;
}

interface InvoiceDetail {
  amount: string;
  package: Package;
  invoice_detail_addons: InvoiceDetailAddOn[];
}

interface InvoiceDetailAddOn {
  amount: number;
  quantity: number;
  package_addon: PackageAddOn;
}

interface PackageAddOn {
  id: string;
  name: string;
  price: number;
}
