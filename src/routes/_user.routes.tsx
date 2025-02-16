import LandingLayout from "@layouts/LandingLayout";
import * as Landing from "@/pages/user";

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
    ],
  },
];
