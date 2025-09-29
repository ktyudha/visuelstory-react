import { Navigate } from "react-router-dom";
import DefaultLayout from "@layouts/DefaultLayout";
import * as Admin from "@pages/admin";
import AuthMiddleware from "./middlewares/AuthMiddleware";
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
      { path: "packages/create", element: <Admin.PackageCreatePage /> },
      {
        path: "packages/edit/:packageId",
        element: <Admin.PackageUpdatePage />,
      },

      // Package Category
      { path: "package-categories", element: <Admin.PackageCategoryPage /> },
      {
        path: "package-categories/create",
        element: <Admin.PackageCategoryCreatePage />,
      },
      {
        path: "package-categories/edit/:packageCategoryId",
        element: <Admin.PackageCategoryUpdatePage />,
      },

      // Package Add On
      { path: "package-addons", element: <Admin.PackageAddonPage /> },
      {
        path: "package-addons/create",
        element: <Admin.PackageAddonCreatePage />,
      },
      {
        path: "package-addons/edit/:packageAddOnId",
        element: <Admin.PackageAddonUpdatePage />,
      },

      // Event
      { path: "events", element: <Admin.EventPage /> },
      // Invoice
      { path: "invoices", element: <Admin.InvoicePage /> },
      { path: "invoices/create", element: <Admin.InvoiceCreatePage /> },
      { path: "invoices/show/:invoiceId", element: <Admin.InvoiceShowPage /> },
    ],
  },
];
