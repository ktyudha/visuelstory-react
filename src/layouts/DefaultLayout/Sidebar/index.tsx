import ThemeToggle from "../../../theme/ThemeToggle";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useLogout from "@modules/auth/services/hooks/useLogout";
import useGlobalStore from "@store/useStore";
import { useShallow } from "zustand/shallow";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import clsx from "clsx";

import {
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  createTheme,
  ThemeProvider,
} from "flowbite-react";
import { HiOutlineChevronDown, HiOutlineChevronDoubleLeft, HiOutlineLogout, HiOutlineMenuAlt2 } from "react-icons/hi";

import { sidebarOrganizer } from "./sidebar-admin.constant";
import BreadcrumbComponent from "@components/Flowbite/Breadcrumb";
import { useOutsideClick } from "@hooks/useOutsideClick";

interface Props {
  children: React.ReactNode;
}

export default function SidebarDefaultLayout({ children }: Props) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Mode ciut (hanya ikon) untuk desktop; pilihan diingat di browser
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("admin-sidebar-collapsed") === "1"; } catch { return false; }
  });
  const setCollapsedPersist = (v: boolean) => {
    setCollapsed(v);
    try { localStorage.setItem("admin-sidebar-collapsed", v ? "1" : "0"); } catch { /* abaikan */ }
  };
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

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
        toast.error("Gagal keluar", {
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
            onClick={() => (window.innerWidth >= 640 ? setCollapsedPersist(!collapsed) : toggleSidebar())}
            type="button"
            aria-label="Buka / ciutkan menu"
            className="mr-2 inline-flex cursor-pointer items-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <HiOutlineMenuAlt2 className="size-6" />
          </button>
          <img src="/logo-circle.svg" className="mr-3 h-6 sm:h-9" alt="Logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white italic">
            Visuelstory
          </span>
        </NavbarBrand>

        <div className="flex items-center gap-2">
          <ThemeToggle className="!text-gray-500 hover:!bg-gray-100 hover:!text-gray-900 dark:!text-gray-400 dark:hover:!bg-gray-700 dark:hover:!text-white" />
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <span className="grid size-9 place-items-center rounded-full bg-gray-900 text-sm font-semibold uppercase text-white dark:bg-white dark:text-gray-900">
                {(me?.name || me?.whatsapp || "A").trim().charAt(0)}
              </span>
            }
          >
            <DropdownHeader>
              <span className="block text-sm font-medium">{me?.name || "Admin"}</span>
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
              {isLoading ? "Memproses..." : "Keluar"}
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
        aria-label="Menu admin"
        className={clsx(
          "fixed top-0 left-0 z-40 h-screen w-64 border-r border-gray-200 bg-white pt-15 transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800 sm:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          collapsed && "sm:w-[4.5rem]"
        )}
      >
        <nav className="flex h-full flex-col overflow-y-auto overflow-x-hidden px-3 py-4">
          <ul className="space-y-1">
            {sidebarOrganizer.map((sidebar) => {
              const seg = currentPath.split("/")[2];
              const row = (active: boolean) =>
                clsx(
                  "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "sm:justify-center sm:px-0",
                  active
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                );
              const label = (text: string) => <span className={clsx("truncate", collapsed && "sm:hidden")}>{text}</span>;

              if (sidebar.hasChild && sidebar.children) {
                const activeChild = sidebar.children.some((c) => c.route.split("/")[2] === seg);
                const open = !collapsed && (openGroups[sidebar.label] ?? activeChild);
                return (
                  <li key={sidebar.label}>
                    <button
                      type="button"
                      title={sidebar.label}
                      aria-expanded={open}
                      onClick={() => {
                        // Saat ciut: buka sidebar dulu agar submenu terlihat
                        if (collapsed && window.innerWidth >= 640) { setCollapsedPersist(false); setOpenGroups((g) => ({ ...g, [sidebar.label]: true })); return; }
                        setOpenGroups((g) => ({ ...g, [sidebar.label]: !(g[sidebar.label] ?? activeChild) }));
                      }}
                      className={row(activeChild && !open)}
                    >
                      <sidebar.icon className="size-5 shrink-0" />
                      {label(sidebar.label)}
                      <HiOutlineChevronDown className={clsx("ml-auto size-4 shrink-0 transition-transform", open && "rotate-180", collapsed && "sm:hidden")} />
                    </button>
                    {open && (
                      <ul className="mt-1 space-y-1 border-l border-gray-200 pl-3 ml-5 dark:border-gray-700">
                        {sidebar.children.map((child) => {
                          const active = child.route.split("/")[2] === seg;
                          return (
                            <li key={child.route}>
                              <Link to={child.route} onClick={() => setSidebarOpen(false)}
                                className={clsx("block rounded-lg px-3 py-2 text-sm transition-colors", active ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-700 dark:text-white" : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50")}>
                                {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={sidebar.label}>
                  <Link to={sidebar.route ?? "#"} title={sidebar.label} onClick={() => setSidebarOpen(false)} className={row(sidebar.route?.split("/")[2] === seg)}>
                    <sidebar.icon className="size-5 shrink-0" />
                    {label(sidebar.label)}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Tombol ciutkan (desktop) */}
          <button
            type="button"
            onClick={() => setCollapsedPersist(!collapsed)}
            title={collapsed ? "Perluas menu" : "Ciutkan menu"}
            className={clsx("mt-auto hidden cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50 sm:flex", collapsed && "sm:justify-center sm:px-0")}
          >
            <HiOutlineChevronDoubleLeft className={clsx("size-5 shrink-0 transition-transform", collapsed && "rotate-180")} />
            <span className={clsx(collapsed && "sm:hidden")}>Ciutkan menu</span>
          </button>
        </nav>
      </aside>

      <div className={clsx("p-4 transition-[margin] duration-300", collapsed ? "sm:ml-[4.5rem]" : "sm:ml-64")}>
        <div className="rounded-lg mt-16">
          {/* Header */}

          <div className="mb-5 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-semibold">{finalActiveLabel}</h1>
            <div>
              <BreadcrumbComponent currentPath={currentPath} />
            </div>
          </div>

          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}
