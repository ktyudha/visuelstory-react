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
      { path: "package-addons", element: <Admin.PackageAddonPage /> },

      // Package
      { path: "packages", element: <Admin.PackagePage /> },
      { path: "packages/create", element: <Admin.PackageCreatePage /> },
      {
        path: "packages/edit/:packageId",
        element: <Admin.PackageUpdatePage />,
      },

      // Package
      { path: "package-categories", element: <Admin.PackageCategoryPage /> },
      {
        path: "package-categories/create",
        element: <Admin.PackageCategoryCreatePage />,
      },
      {
        path: "package-categories/edit/:packageCategoryId",
        element: <Admin.PackageCategoryUpdatePage />,
      },
    ],
  },
];
