export interface ICreatePayload {
  customer_id: string;
  proof?: File;
  packages: Package[];
  price: string;
  amount_paid: number;
  discount: number;
}

interface Package {
  id: string;
  quantity: number;
  note: string;
  location: string;
  date: Date;
  package_addons: PackageAddOn[] | null;
}

interface PackageAddOn {
  id: string;
  quantity: number;
}

export interface IUpdatePayload {
  customer_id: string;
  amount_paid: number;
  transaction_status: number;
}

// create payload for ui
export interface UiPackagePayload {
  customer_id: string;
  packages: UiPackage[];
  price: string;
  amount_paid: number;
  discount: number;
}
export interface UiPackage {
  // package
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  price_final: number;

  // event
  quantity: number;
  note: string;
  location: string;
  date: Date;

  package_addons?: UiPackageAddOn[] | null;
}

export interface UiPackageAddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
