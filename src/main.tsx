import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { initTheme } from "./theme/theme";
import GetBrowserRoutes from "./routes/index.routes";
import { Slide, ToastContainer } from "react-toastify";
import "./styles/index.css";
import "react-toastify/dist/ReactToastify.css";

dayjs.locale("id"); // nama hari & bulan berbahasa Indonesia di seluruh aplikasi
initTheme();

// Bersihkan service worker & cache sisa PWA lama agar pengguna lama tidak tersangkut versi usang
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
  if ("caches" in window) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {});
}

const router = createBrowserRouter(GetBrowserRoutes());
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <StrictMode>
    <ToastContainer position="top-center" transition={Slide} autoClose={3000} hideProgressBar limit={3} closeButton={false} />
    <RouterProvider router={router} />
  </StrictMode>
);
