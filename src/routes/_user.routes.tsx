import { lazy } from "react";
import LandingLayout from "@layouts/LandingLayout";
import CustomLayout from "@layouts/CustomLayout";
import * as Landing from "@pages/user";

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
      { path: "contact", element: <Landing.ContactPage /> },
      { path: "investment", element: <Landing.InvestmentPage /> },
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
