export interface Category {
  id: string;
  name: string;
}

export interface CatalogPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  price_final: number;
  includes_video?: boolean;
  package_category: Category | null;
}

export interface CatalogAddon {
  id: string;
  name: string;
  price: number;
}

export interface Catalog {
  categories: Category[];
  packages: CatalogPackage[];
  addons: CatalogAddon[];
}

export interface OrderEvent {
  id: string;
  note: string;
  date: string;
  location: string;
}

export interface OrderDetail {
  package: { id: string; name: string; description: string; category: string } | null;
  quantity: number;
  amount: number;
  invoice_detail_addons: { quantity: number; amount: number; package_addon?: { id: string; name: string } | null }[];
  events?: OrderEvent[];
}

export type TransactionStatus = "unpaid" | "down_payment" | "paid";

export interface Order {
  id: string;
  invoice_number: string;
  transaction_status: TransactionStatus;
  total_price: number;
  amount_paid: number;
  remaining_paid: number;
  created_at: string;
  invoice_details: OrderDetail[];
  payments?: { id: string; amount: number; paid_at: string; method: string; note: string | null }[];
  gallery_ready: boolean;
  edited_ready?: boolean;
  video_url?: string | null;
  delivery?: import("@modules/admin/shared/delivery-ui").Delivery;
  selection_limit: number | null;
  selection_submitted_at: string | null;
}

export interface Photo {
  id: string;
  name: string;
  size: number | null;
  width: number | null;
  height: number | null;
  selected: boolean;
  thumb_url: string;
  preview_url: string;
  download_url: string;
}

export interface Gallery {
  invoice_id: string;
  invoice_number: string;
  folder_url: string | null;
  edited_ready?: boolean;
  selection_limit: number | null;
  selection_count?: number;
  submitted_at: string | null;
  deadline_at: string | null;
  closed: boolean;
  now: string;
  note: string | null;
  photos: Photo[];
}

export interface EditedGallery {
  invoice_id: string;
  invoice_number: string;
  folder_url: string | null;
  delivered_at: string;
  video_url: string | null;
  photos: Omit<Photo, "selected">[];
}

export interface BookingPayload {
  name: string;
  email?: string;
  address?: string;
  packages: {
    id: string;
    quantity: number;
    date: string;
    location: string;
    note?: string;
    package_addons?: { id: string; quantity: number }[];
  }[];
}
