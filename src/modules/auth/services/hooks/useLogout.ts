import axiosInstance from "@lib/axios-instance";
import Cookies from "js-cookie";
import { Role } from "@modules/auth/services/role.def";
import useGlobalStore from "@store/useStore";

const TOKEN_KEYS = { admin: "token", customer: "token-customer" } as const;
const LOGOUT_URLS = { admin: "/auth/admin/logout", customer: "/auth/customer/logout" } as const;

export default function useLogout() {
  /**
   * Keluar selalu berhasil di sisi pengguna: token lokal dihapus walau server
   * tidak terjangkau atau token sudah kedaluwarsa (401). Pencabutan token di server
   * dicoba sebisanya.
   */
  const handleLogout = async (role: Role) => {
    const token = Cookies.get(TOKEN_KEYS[role]);
    let message: string | null = "Berhasil keluar";

    if (token) {
      try {
        const { data } = await axiosInstance({ withToken: true, tokenType: role }).post(LOGOUT_URLS[role]);
        message = data?.message ?? message;
      } catch {
        // abaikan: token lokal tetap dihapus di bawah
      }
    }

    Cookies.remove(TOKEN_KEYS[role], { path: "/" });
    useGlobalStore.setState({ me: undefined, isLoggedIn: false });

    return { data: message, error: null };
  };

  return { handleLogout };
}
