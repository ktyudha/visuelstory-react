import { lazy } from "react";
import LandingLayout from "@layouts/LandingLayout";
import * as Landing from "@pages/user";

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
      { path: "about", element: <Landing.AboutPage /> },
      { path: "contact", element: <Landing.ContactPage /> },
      { path: "investment", element: <Landing.InvestmentPage /> },
    ],
  },
  {
    path: "/links",
    element: <LinkPage />,
  },
];
