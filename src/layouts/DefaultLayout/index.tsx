import { HelmetProvider } from "react-helmet-async";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Outlet } from "react-router-dom";
import Metadata from "@components/Metadata";

export default function DefaultLayout() {
  return (
    <>
      <HelmetProvider>
        <Metadata />
        <SidebarProvider>
          <AppSidebar />
          <main>
            <SidebarTrigger />
            <Outlet />
          </main>
        </SidebarProvider>
      </HelmetProvider>
    </>
  );
}
