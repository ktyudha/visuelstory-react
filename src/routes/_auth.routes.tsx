import {
  CustomerAuthPage,
  AdminLoginPage,
  AdminVerifyOtpPage,
} from "@pages/auth";
import { Navigate } from "react-router-dom";
import AuthMiddleware from "./middlewares/AuthMiddleware";

export default [
  {
    // Masuk & daftar satu alur: nomor -> OTP -> (nama, bila akun baru). Redirect ditangani halaman ini.
    path: "/login",
    element: <CustomerAuthPage />,
  },
  {
    path: "/verify-otp",
    element: <Navigate to="/login" replace />,
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
