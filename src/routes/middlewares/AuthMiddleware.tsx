import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@constants/firebase";
import useGlobalStore from "@store/useStore";

type Props = {
  children: React.ReactNode;
  withoutRedirection?: boolean;
};

export default function AuthMiddleware({
  children,
  withoutRedirection,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const setMe = useGlobalStore((state) => state.setMe);
  // const setRole = useGlobalStore((state) => state.setRole);
  const setIsLoggedIn = useGlobalStore((state) => state.setIsLoggedIn);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Pengguna sudah login
        setIsLoggedIn(true);
        setMe(user);

        if (pathname.includes("login")) {
          navigate("/admin/dashboard");
        }
      } else {
        // Pengguna belum login
        setIsLoggedIn(false);

        if (!withoutRedirection) {
          navigate("/admin/login");
        }
      }
      setMounted(true);
    });

    return () => unsubscribe();
  }, [auth, pathname, navigate, setIsLoggedIn]);

  return <>{mounted ? children : <>Loading...</>}</>;
}
