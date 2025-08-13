import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useLogout from "@modules/auth/services/hooks/useLogout";
import useGlobalStore from "@store/useStore";
import { useShallow } from "zustand/shallow";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import clsx from "clsx";

import {
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  DarkThemeToggle,
  createTheme,
  ThemeProvider,
  Sidebar,
  SidebarCollapse,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import { HiOutlineLogout } from "react-icons/hi";

import { sidebarOrganizer } from "./sidebar-admin.constant";
import BreadcrumbComponent from "@components/Flowbite/Breadcrumb";
import { useOutsideClick } from "@hooks/useOutsideClick";

interface Props {
  children: React.ReactNode;
}

export default function SidebarDefaultLayout({ children }: Props) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarRef = useOutsideClick(() => {
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }
  });

  const fallbackLabel = currentPath.split("/")[2] || ""; // ambil index ke-2 (elemen ketiga)

  const activeSidebar = sidebarOrganizer.find((sidebar) => {
    if (sidebar.hasChild && sidebar.children) {
      return sidebar.children.some((child) => child.route === currentPath);
    }
    return sidebar.route === currentPath;
  });

  const activeLabel =
    activeSidebar?.label ||
    fallbackLabel.charAt(0).toUpperCase() + fallbackLabel.slice(1);

  const finalActiveLabel = activeLabel
    .split("-") // Jika ada dash, pisah
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Kapitalisasi setiap kata
    .join(" ");

  const { role, me } = useGlobalStore(
    useShallow((state) => ({
      role: state.role,
      me: state.me,
    }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const { handleLogout } = useLogout();

  const onHandleLogout = async () => {
    setIsLoading(true);
    const { data, error } = await handleLogout(role);
    if (data || error) {
      if (data) {
        setIsLoading(false);
        if (role === "admin") {
          Cookies.remove("token");
          navigate("/admin/login", { replace: true });
        } else if (role === "customer") {
          Cookies.remove("token-customer");
          navigate("/login", { replace: true });
        }
      } else {
        setIsLoading(false);
        toast.error("Logout Gagal", {
          position: "top-right",
          data: {
            text: error,
          },
        });
      }
    }
  };

  const customTheme = createTheme({
    root: "bg-white",
    navbar: {
      root: {
        base: "fixed top-0 z-50 w-full bg-white rounded-none border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700",
        inner: {
          base: "mx-auto flex flex-wrap items-center justify-between",
        },
      },
    },
    sidebar: {
      root: {
        base: "fixed top-0 left-0 z-40 w-64 h-screen pt-15 transition-transform bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700",
        inner: "h-full overflow-y-auto px-3 py-4 bg-white dark:bg-gray-800",
      },
    },
  });

  return (
    <ThemeProvider theme={customTheme} applyTheme={"merge"}>
      {/* Navbar */}
      <Navbar fluid>
        <NavbarBrand href="#">
          <button
            onClick={toggleSidebar}
            type="button"
            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <img src="/logo-circle.svg" className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white italic">
            Visuelstory
          </span>
        </NavbarBrand>

        <div className="flex items-center gap-2">
          <DarkThemeToggle />
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                img="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                alt="User"
                rounded
              />
            }
          >
            <DropdownHeader>
              <span className="block text-sm">{me?.name}</span>
              <span className="block text-sm font-medium truncate">
                {me?.email}
              </span>
            </DropdownHeader>
            <DropdownDivider />
            <DropdownItem
              onClick={() => onHandleLogout()}
              className="text-red-500 dark:text-red-500 font-semibold"
              icon={HiOutlineLogout}
            >
              {isLoading ? "Loading..." : "Sign Out"}
            </DropdownItem>
          </Dropdown>
        </div>
      </Navbar>

      {/* BLUR */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm sm:hidden"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed top-0 left-0 z-40 w-64 h-screen pt-15 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 sm:translate-x-0`}
      >
        <Sidebar aria-label="Sidebar with multi-level dropdown example">
          <SidebarItems>
            <SidebarItemGroup>
              {sidebarOrganizer.map((sidebar, index) => {
                const isActiveChild = sidebar.children?.some(
                  (child) =>
                    child.route.split("/")[2] === currentPath.split("/")[2]
                );

                if (sidebar.hasChild && sidebar.children) {
                  return (
                    <SidebarCollapse
                      key={`sidebar-collapse-${index}`}
                      icon={sidebar.icon}
                      label={sidebar.label}
                      open={isActiveChild}
                      className="cursor-pointer"
                    >
                      {sidebar.children.map((child, childIndex) => (
                        <SidebarItem
                          key={`sidebar-child-${childIndex}`}
                          onClick={() => child.route && navigate(child.route)}
                          className={clsx(
                            `cursor-pointer`,
                            child.route.split("/")[2] ===
                              currentPath.split("/")[2]
                              ? "bg-gray-100 dark:bg-gray-700"
                              : ""
                          )}
                        >
                          {child.label}
                        </SidebarItem>
                      ))}
                    </SidebarCollapse>
                  );
                }

                return (
                  <SidebarItem
                    key={`sidebar-item-${index}`}
                    icon={sidebar.icon}
                    onClick={() => sidebar.route && navigate(sidebar.route)}
                    className={clsx(
                      `cursor-pointer`,
                      sidebar.route === currentPath
                        ? "bg-gray-100 dark:bg-gray-700"
                        : ""
                    )}
                  >
                    {sidebar.label}
                  </SidebarItem>
                );
              })}
            </SidebarItemGroup>
          </SidebarItems>
        </Sidebar>
      </aside>

      <div className="p-4 sm:ml-64">
        <div className="rounded-lg mt-16">
          {/* Header */}

          <div className="w-full py-4 mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg justify-between md:flex">
            <h1 className="text-4xl font-medium px-6">{finalActiveLabel}</h1>
            <div className="right-0 px-6 mt-3">
              <BreadcrumbComponent currentPath={currentPath} />
            </div>
          </div>

          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
