import { Outlet } from "react-router-dom";

import LandingNavbar from "./LandingNavbar";

export default function LandingLayout() {
  return (
    <div className="w-full">
      <LandingNavbar />

      <main>
        <Outlet />
      </main>
    </div>
  );
}
