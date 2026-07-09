import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { initThemeMode } from "flowbite-react";
import GetBrowserRoutes from "./routes/index.routes";
import { ToastContainer } from "react-toastify";
import "./styles/index.css";
import "react-toastify/dist/ReactToastify.css";

initThemeMode();

const router = createBrowserRouter(GetBrowserRoutes());
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <StrictMode>
    <ToastContainer position="top-center" />
    <RouterProvider router={router} />
  </StrictMode>
);
