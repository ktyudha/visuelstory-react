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

// PWA: simpan event pasang aplikasi lebih awal, daftarkan service worker (production saja)
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  (window as unknown as { __installPrompt?: Event }).__installPrompt = e;
  window.dispatchEvent(new Event("install-available"));
});
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
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
