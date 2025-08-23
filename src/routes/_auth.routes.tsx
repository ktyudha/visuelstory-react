import {
  UserSendOtpPage,
  UserVerifyOtpPage,
  AdminLoginPage,
  AdminVerifyOtpPage,
} from "@pages/auth";
import AuthMiddleware from "./middlewares/AuthMiddleware";

export default [
  {
    path: "/login",
    element: (
      <AuthMiddleware>
        <UserSendOtpPage />
      </AuthMiddleware>
    ),
  },
  {
    path: "/verify-otp",
    element: <UserVerifyOtpPage />,
  },
  {
    path: "/admin/login",
    element: (
      <AuthMiddleware>
        <AdminLoginPage />
      </AuthMiddleware>
    ),
  },
  {
    path: "/admin/verify-otp",
    element: <AdminVerifyOtpPage />,
  },
];
