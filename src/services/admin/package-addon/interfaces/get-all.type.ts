import { Pagination } from "@services/global/pagination/interfaces/pagination.type";

export interface IGetAll {
  data: PackageAddOn[];
  pagination: Pagination;
}

export interface IGet {
  data: PackageAddOn;
}

export interface PackageAddOn {
  id: string;
  name: string;
  price: number;
}
