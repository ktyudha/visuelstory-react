import CustomLayout from "@layouts/CustomLayout";
import { AdminLoginPage } from "@pages/auth";
import AuthMiddleware from "./middlewares/AuthMiddleware";

export default [
  // Auth
  // {
  //   path: "/login",
  //   element: <LoginPage />,
  // },
  {
    path: "/admin/login",

    element: (
      <AuthMiddleware>
        <CustomLayout />
      </AuthMiddleware>
    ),
    children: [{ index: true, element: <AdminLoginPage /> }],
  },
];
