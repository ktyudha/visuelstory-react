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
  package: Package;
  invoice: Invoice;
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
}

interface Invoice {
  id: string;
  number: string;
}
