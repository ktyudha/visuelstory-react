export interface ICreatePayload {
  customer_id: string;
  proof: File;
  packages: Package[];
  price: string;
  discount: number;
}

interface Package {
  id: string;
  quantity: string;
  note: string;
  location: string;
  date: Date;
  package_addons: PackageAddOn[] | null;
}

interface PackageAddOn {
  id: string;
  quantity: string;
}
