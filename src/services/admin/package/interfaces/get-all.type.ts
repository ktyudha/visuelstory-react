import { Pagination } from "@services/global/pagination/interfaces/pagination.type";

export interface IGetAll {
  data: Package[];
  pagination: Pagination;
}

export interface IGet {
  data: Package;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  price_final: number;
  includes_video?: boolean;
  package_category: PackageCategory;
}

interface PackageCategory {
  id: string;
  name: string;
}
