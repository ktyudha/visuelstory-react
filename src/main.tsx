import { StrictMode, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GetBrowserRoutes from "./routes/index.routes";
import { ToastContainer } from "react-toastify";
import Loader from "@components/Reusable/Loader";
import "./styles/index.css";
import "./styles/global.css";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter(GetBrowserRoutes());
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <StrictMode>
    <ToastContainer />
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
);
