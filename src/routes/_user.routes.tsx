import { lazy } from "react";
import LandingLayout from "@layouts/LandingLayout";
import CustomLayout from "@layouts/CustomLayout";
import * as Landing from "@pages/user";

import CustomerLayout from "@layouts/CustomerLayout";
import * as Customer from "@pages/customer";
import AuthMiddleware from "./middlewares/AuthMiddleware";
import ErrorPage from "@pages/ErrorPage";

const LinkPage = lazy(() => import("@pages/user/LinkPage"));

// import LinkPage from "@pages/user/LinkPage";

export default [
  // User
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      { index: true, element: <Landing.LandingPage /> },
      { path: "portfolio", element: <Landing.PortfolioPage /> },
      { path: "portfolio/:slug", element: <Landing.PortfolioDetailPage /> },
      { path: "about", element: <Landing.AboutPage /> },
      { path: "investment", element: <Landing.InvestmentPage /> },
      { path: "contact", element: <Landing.ContactPage /> },
    ],
  },
  // Area customer (wajib login): booking, pesanan, galeri & seleksi foto
  {
    element: (
      <AuthMiddleware>
        <CustomerLayout />
      </AuthMiddleware>
    ),
    children: [
      { path: "booking", element: <Customer.BookingPage /> },
      { path: "booking/package/:packageId", element: <Customer.PackageDetailPage /> },
      { path: "account", element: <Customer.OrdersPage /> },
      { path: "account/studio", element: <Customer.StudioPage /> },
      { path: "account/profile", element: <Customer.ProfilePage /> },
      { path: "account/orders/:orderId", element: <Customer.OrderDetailPage /> },
      { path: "account/orders/:orderId/invoice", element: <Customer.InvoicePage /> },
    ],
  },
  {
    path: "/links",
    element: <CustomLayout />,
    children: [{ index: true, element: <LinkPage /> }],
  },
  {
    path: "/error-page",
    element: <ErrorPage />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
];
