import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isStandalone } from "../../theme/useInstallPrompt";
import { applyTheme } from "../../theme/theme";
import { HelmetProvider } from "react-helmet-async";

import LandingHelmet from "./LandingHelmet";
import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";
import Metadata from "@components/Metadata";

export default function LandingLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.forceLight = "1";
    applyTheme();

    return () => {
      delete html.dataset.forceLight;
      applyTheme();
    };
  }, []);

  // Dibuka sebagai aplikasi (PWA): langsung ke area customer, bukan halaman promosi.
  if (pathname === "/" && isStandalone()) return <Navigate to="/account" replace />;

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
