import { FunctionComponent } from "react";
import { Outlet } from "react-router-dom";

import SidebarDefaultLayout from "./Sidebar";

const DefaultLayout: FunctionComponent = () => {
  return (
    <>
      <div className="h-full">
        <SidebarDefaultLayout>
          <main>
            <Outlet />
          </main>
        </SidebarDefaultLayout>
      </div>
    </>
  );
};

export default DefaultLayout;
