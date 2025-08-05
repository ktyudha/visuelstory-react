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
    ],
  },
];
