import { Navigate } from "react-router-dom";
import DefaultLayout from "@layouts/DefaultLayout";
import * as Admin from "@pages/admin";
import AuthMiddleware from "./middlewares/AuthMiddleware";
// import AuthMiddleware from "./middlewares/AuthMiddleware";
// import {
//   BookCategoryCreatePage,
//   BookCategoryPage,
//   BookPage,
//   DashboardPage,
//   PartnerCreatePage,
//   PartnerPage,
//   SupplierCreatePage,
//   SupplierPage,
// } from "@pages/admin";
// import CommonInvoiceCreatePage from "@pages/[common]/invoices/InvoiceCreatePage";
// import CommonInvoicePage from "@pages/[common]/invoices/InvoicePage";
// import BookSubCategoryPage from "@pages/admin/master-data/book-sub-categories/BookSubCategoryPage";
// import BookSubCategoryCreatePage from "@pages/admin/master-data/book-sub-categories/BookSubCategoryCreatePage";

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
      //   { path: "master-data/books", element: <BookPage /> },
      //   {
      //     path: "master-data/book-categories",
      //     element: <BookCategoryPage />,
      //   },
      //   {
      //     path: "master-data/book-categories/create",
      //     element: <BookCategoryCreatePage />,
      //   },
      //   {
      //     path: "master-data/book-categories/:bookCategoryId/edit",
      //     element: <BookCategoryCreatePage />,
      //   },
      //   {
      //     path: "master-data/book-sub-categories",
      //     element: <BookSubCategoryPage />,
      //   },
      //   {
      //     path: "master-data/book-sub-categories/create",
      //     element: <BookSubCategoryCreatePage />,
      //   },
      //   {
      //     path: "master-data/book-sub-categories/:bookSubCategoryId/edit",
      //     element: <BookSubCategoryCreatePage />,
      //   },
      //   { path: "suppliers", element: <SupplierPage /> },
      //   { path: "suppliers/create", element: <SupplierCreatePage /> },
      //   {
      //     path: "suppliers/:supplierId/edit",
      //     element: <SupplierCreatePage />,
      //   },
      //   { path: "partners", element: <PartnerPage /> },
      //   { path: "partners/create", element: <PartnerCreatePage /> },
      //   {
      //     path: "partners/:partnerId/edit",
      //     element: <PartnerCreatePage />,
      //   },
      //   { path: "invoices", element: <CommonInvoicePage /> },
      //   { path: "invoices/create", element: <CommonInvoiceCreatePage /> },
      //   {
      //     path: "invoices/:invoiceId/edit",
      //     element: <CommonInvoiceCreatePage />,
      //   },
    ],
  },
];
