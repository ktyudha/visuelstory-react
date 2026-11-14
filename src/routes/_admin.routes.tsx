import { Navigate, useParams } from "react-router-dom";
import DefaultLayout from "@layouts/DefaultLayout";
import * as Admin from "@pages/admin";
import AuthMiddleware from "./middlewares/AuthMiddleware";
function EditRedirect() {
  const { invoiceId } = useParams();
  return <Navigate to={`/admin/invoices/show/${invoiceId}`} replace />;
}

/** Tautan lama /create & /edit/:id sekarang membuka modal di halaman daftar. */
function ModalRedirect({ to, param }: { to: string; param?: string }) {
  const params = useParams();
  const id = param ? params[param] : null;
  return <Navigate to={id ? `${to}?edit=${id}` : `${to}?new=1`} replace />;
}

export default [
  {
    path: "/admin",
    element: (
      <AuthMiddleware>
        <DefaultLayout />
      </AuthMiddleware>
    ),
    // errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="dashboard" /> },
      { path: "dashboard", element: <Admin.DashboardPage /> },

      // Package
      { path: "packages", element: <Admin.PackagePage /> },
      { path: "packages/create", element: <ModalRedirect to="/admin/packages" /> },
      { path: "packages/edit/:id", element: <ModalRedirect to="/admin/packages" param="id" /> },

      // Package Category
      { path: "package-categories", element: <Admin.PackageCategoryPage /> },
      { path: "package-categories/create", element: <ModalRedirect to="/admin/package-categories" /> },
      { path: "package-categories/edit/:id", element: <ModalRedirect to="/admin/package-categories" param="id" /> },

      // Package Add On
      { path: "package-addons", element: <Admin.PackageAddonPage /> },
      { path: "package-addons/create", element: <ModalRedirect to="/admin/package-addons" /> },
      { path: "package-addons/edit/:id", element: <ModalRedirect to="/admin/package-addons" param="id" /> },

      // Event
      { path: "events", element: <Admin.EventPage /> },

      // Invoice
      { path: "invoices", element: <Admin.InvoicePage /> },
      { path: "invoices/create", element: <Admin.InvoiceCreatePage /> },
      { path: "invoices/show/:invoiceId", element: <Admin.InvoiceShowPage /> },
      // Edit invoice dihapus: pembayaran dicatat bertahap di halaman detail.
      { path: "invoices/edit/:invoiceId", element: <EditRedirect /> },

      // Customer
      { path: "customers", element: <Admin.CustomerPage /> },
      { path: "customers/create", element: <ModalRedirect to="/admin/customers" /> },
      { path: "customers/edit/:id", element: <ModalRedirect to="/admin/customers" param="id" /> },
      { path: "customers/show/:customerId", element: <Admin.CustomerShowPage /> },
    ],
  },
];
