import { getMe } from "@modules/auth/services/hooks/useGetMe";
import { User } from "@modules/auth/services/interfaces/login.types";
import useGlobalStore from "@store/useStore";
import { safeRedirect } from "@helpers/safe-redirect";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Role = "admin" | "customer";

type Props = {
  children: React.ReactNode;
  withoutRedirection?: boolean;
};

const LOGIN_PATHS = ["/admin/login", "/login"];

const hasToken = (role: Role) =>
  Boolean(Cookies.get(role === "admin" ? "token" : "token-customer"));

export default function AuthMiddleware({ children, withoutRedirection }: Props) {
  const [mounted, setMounted] = useState(false);

  const setMe = useGlobalStore((state) => state.setMe);
  const setRole = useGlobalStore((state) => state.setRole);
  const setIsLoggedIn = useGlobalStore((state) => state.setIsLoggedIn);

  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  // Area /admin memakai token admin, selainnya memakai token customer.
  const role: Role = pathname.startsWith("/admin") ? "admin" : "customer";
  const isLoggedIn = hasToken(role);

  useEffect(() => {
    setIsLoggedIn(isLoggedIn);
    setRole(role);
    if (!isLoggedIn) return;

    let cancelled = false;
    getMe(role)
      .then(({ data }) => {
        if (!cancelled) setMe(data.data as User);
      })
      .catch(() => {
        // 401 ditangani interceptor (token dihapus); render ulang akan mengarahkan ke login.
        if (!cancelled) setIsLoggedIn(hasToken(role));
      });
    return () => {
      cancelled = true;
    };
  }, [role, isLoggedIn, setMe, setRole, setIsLoggedIn]);

  useEffect(() => {
    const isLoginPage = LOGIN_PATHS.includes(pathname);

    if (!isLoggedIn) {
      if (!withoutRedirection && !isLoginPage) {
        const login = role === "admin" ? "/admin/login" : "/login";
        const redirect = encodeURIComponent(pathname + search);
        navigate(role === "admin" ? login : `${login}?redirect=${redirect}`, { replace: true });
        return;
      }
    } else if (isLoginPage) {
      const redirect = new URLSearchParams(search).get("redirect");
      navigate(
        role === "admin" ? "/admin/dashboard" : safeRedirect(redirect) ?? "/account",
        { replace: true }
      );
      return;
    }

    setMounted(true);
  }, [isLoggedIn, pathname, search, role, navigate, withoutRedirection]);

  if (!mounted) return <div className="p-8 text-center text-neutral-500">Loading...</div>;

  return <>{children}</>;
}
