import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import LandingHelmet from "./LandingHelmet";
import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";
import Metadata from "@components/Metadata";

export default function LandingLayout() {
  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    html.classList.remove("dark");

    return () => {
      if (wasDark) html.classList.add("dark");
    };
  }, []);

  return (
    <HelmetProvider>
      <Metadata />
      <LandingHelmet />

      <div className="w-full">
        <LandingNavbar />

        <main>
          <Outlet />
        </main>

        <LandingFooter />
      </div>
    </HelmetProvider>
  );
}
