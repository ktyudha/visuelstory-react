import { Pagination } from "@services/global/pagination/interfaces/pagination.type";

export interface IGetAllPackageCategory {
  data: PackageCategory[];
  pagination: Pagination;
}

export interface IGetPackageCategory {
  data: PackageCategory;
}

export interface PackageCategory {
  id: string;
  name: string;
  description: string;
}
