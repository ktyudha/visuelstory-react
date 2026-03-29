import { getMe } from "@modules/auth/services/hooks/useGetMe";
import { User } from "@modules/auth/services/interfaces/login.types";
import useGlobalStore from "@store/useStore";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "admin" | "customer";

type Props = {
  children: React.ReactNode;
  withoutRedirection?: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveRole(): Role {
  return Cookies.get("token") ? "admin" : "customer";
}

function resolveDashboardPath(role: Role): string {
  return role === "admin" ? "/admin/dashboard" : "/";
}

function resolveLoginPath(pathname: string): string {
  return pathname.startsWith("/admin") ? "/admin/login" : "/login";
}

const LOGIN_PATHS = ["/admin/login", "/login"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function AuthMiddleware({ children, withoutRedirection }: Props) {
  const [mounted, setMounted] = useState(false);

  const setMe = useGlobalStore((state) => state.setMe);
  const setRole = useGlobalStore((state) => state.setRole);
  const setIsLoggedIn = useGlobalStore((state) => state.setIsLoggedIn);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const token = Cookies.get("token-user") ?? Cookies.get("token");
  const isLoggedIn = Boolean(token);
  const role = resolveRole();

  // Sync login state to global store (outside effect — intentionally runs every render)
  setIsLoggedIn(isLoggedIn);

  // Fetch current user and set role
  useEffect(() => {
    setRole(role);
    getMe(role).then(({ data }) => {
      setMe(data.data as User);
    });
  }, [role, setMe, setRole]);

  // Handle redirects
  useEffect(() => {
    if (!isLoggedIn) {
      if (!withoutRedirection && !LOGIN_PATHS.includes(pathname)) {
        navigate(resolveLoginPath(pathname));
      }
    } else if (pathname.includes("login")) {
      navigate(resolveDashboardPath(role));
    }

    setMounted(true);
  }, [isLoggedIn, pathname, role, navigate, withoutRedirection]);

  if (!mounted) return <>Loading...</>;

  return <>{children}</>;
}