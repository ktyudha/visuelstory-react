// import { getMe } from "@modules/[common]/auth/login/hooks/useGetMe";
// import { User } from "@modules/[common]/auth/login/interfaces/login.types";
// import useGlobalStore from "@store/useStore";
// import Cookies from "js-cookie";
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// type Props = {
//   children: React.ReactNode;
//   withoutRedirection?: boolean;
// };

// export default function AuthMiddleware({
//   children,
//   withoutRedirection,
// }: Props) {
//   const [mounted, setMounted] = useState(false);
//   const setMe = useGlobalStore((state) => state.setMe);
//   const setRole = useGlobalStore((state) => state.setRole);
//   const setIsLoggedIn = useGlobalStore((state) => state.setIsLoggedIn);

//   // console.log("auth middleware");

//   const token =
//     Cookies.get("token-partner") ||
//     Cookies.get("token-reader") ||
//     Cookies.get("token-supplier") ||
//     Cookies.get("token");

//   const isLoggedIn = !!token;

//   setIsLoggedIn(!!isLoggedIn);

//   const role = Cookies.get("token")
//     ? "admin"
//     : Cookies.get("token-supplier")
//     ? "supplier"
//     : Cookies.get("token-partner")
//     ? "partner"
//     : "reader";
//   const navigate = useNavigate();
//   const { pathname } = useLocation();

//   useEffect(() => {
//     if (role) {
//       getMe(role).then(({ data }) => {
//         setMe(data.data as User);
//       });

//       setRole(role);
//     }
//   }, [role, setMe, setRole]);

//   const redirectToDashboard = () => {
//     console.log("redirectToDashboard()");
//     console.log("isLoggedIn", isLoggedIn);

//     switch (role) {
//       case "admin":
//         navigate("/admin/dashboard");
//         break;
//       case "supplier":
//         navigate("/supplier/dashboard");
//         break;
//       case "partner":
//         navigate("/partner/dashboard");
//         break;
//       default:
//         navigate("/");
//     }
//   };

//   const redirectToLogin = () => {
//     if (withoutRedirection) {
//       setMounted(true);
//       return;
//     }

//     if (
//       [
//         "/admin/login",
//         "/company/login",
//         "/supplier/login",
//         "/partner/login",
//         "/login",
//       ].includes(pathname)
//     ) {
//       return;
//     }

//     if (pathname.startsWith("admin")) {
//       navigate("/admin/login");
//     } else if (pathname.startsWith("company")) {
//       navigate("/company/login");
//     } else if (pathname.startsWith("supplier")) {
//       navigate("/supplier/login");
//     } else if (pathname.startsWith("partner")) {
//       navigate("/partner/login");
//     } else {
//       navigate("/login");
//     }
//   };

//   useEffect(() => {
//     if (!isLoggedIn) {
//       redirectToLogin();
//       setMounted(true);
//     } else if (isLoggedIn) {
//       if (pathname.includes("login")) {
//         redirectToDashboard();
//       }

//       setMounted(true);
//     }
//   }, [isLoggedIn, pathname]);

//   return <>{mounted ? children : <>Loading...</>}</>;
// }
