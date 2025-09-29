import { Pagination } from "@services/global/pagination/interfaces/pagination.type";

export interface IGetAll {
  data: Customer[];
  pagination: Pagination;
}

export interface IGet {
  data: Customer;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  address: string;
}
