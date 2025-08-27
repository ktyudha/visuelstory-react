import axiosInstance from "@lib/axios-instance";
import Cookies from "js-cookie";
import { Role } from "@modules/auth/services/role.def";

export default function useLogout() {
  const handleLogout = async (role: Role) => {
    const tokenKeys = {
      admin: "token",
      customer: "token-customer",
    } as const;

    const logoutUrls = {
      admin: "/admin/auth/logout",
      customer: "/customer/auth/logout",
    } as const;

    const token = Cookies.get(tokenKeys[role]) ?? "";

    if (!token) {
      return { data: null, status: 401 };
    }

    try {
      const { data } = await axiosInstance({
        withToken: true,
        tokenType: role,
      }).post(logoutUrls[role]);

      // Hapus token di cookie
      Cookies.remove(tokenKeys[role], { path: "/" });

      return { data: data.message, error: null };
    } catch (error: any) {
      if (!error) {
        return { data: null, status: 500 };
      }
      return { data: error.message, status: error.status };
    }
  };

  return { handleLogout };
}
