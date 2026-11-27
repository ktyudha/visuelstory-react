import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { applyTheme } from "../../theme/theme";
import { HelmetProvider } from "react-helmet-async";

import LandingHelmet from "./LandingHelmet";
import LandingNavbar from "./LandingNavbar";
import LandingFooter from "./LandingFooter";
import Metadata from "@components/Metadata";

export default function LandingLayout() {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.forceLight = "1";
    applyTheme();

    return () => {
      delete html.dataset.forceLight;
      applyTheme();
    };
  }, []);

  return (
    <HelmetProvider>
      <Metadata />
      <LandingHelmet />

      <div className="landing-root w-full">
        <LandingNavbar />

        <main>
          <Outlet />
        </main>

        <LandingFooter />
      </div>
    </HelmetProvider>
  );
}
