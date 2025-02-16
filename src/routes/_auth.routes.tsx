import { LoginPage } from "@pages/auth";
// import AuthMiddleware from "./middlewares/AuthMiddleware";

export default [
  // Auth
  {
    path: "/login",
    element: <LoginPage />,
  },
  //   {
  //     path: "/admin/login",
  //     element: (
  //       <AuthMiddleware>
  //         <AdminLoginPage />
  //       </AuthMiddleware>
  //     ),
  //   },
];
