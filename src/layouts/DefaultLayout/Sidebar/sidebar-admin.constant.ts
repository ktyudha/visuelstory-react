import {
  //   HiArrowSmRight,
  HiOutlineHome,
  HiOutlineCalendar,
  //   HiInbox,
  HiOutlineUserGroup,
  HiOutlineMenu,
  HiOutlineDocumentText,
  HiOutlineChartBar,
} from "react-icons/hi";

export const sidebarOrganizer = [
  {
    label: "Dashboard",
    icon: HiOutlineHome,
    route: "/admin/dashboard",
    hasChild: false,
  },
  {
    label: "Paket",
    icon: HiOutlineMenu,
    hasChild: true,
    children: [
      {
        label: "Kategori",
        route: "/admin/package-categories",
      },
      {
        label: "Add-on",
        route: "/admin/package-addons",
      },
      {
        label: "Daftar paket",
        route: "/admin/packages",
      },
    ],
  },
  {
    label: "Invoice",
    icon: HiOutlineDocumentText,
    route: "/admin/invoices",
    hasChild: false,
  },
  {
    label: "Rekap omzet",
    icon: HiOutlineChartBar,
    route: "/admin/revenue",
    hasChild: false,
  },
  {
    label: "Jadwal acara",
    icon: HiOutlineCalendar,
    route: "/admin/events",
    hasChild: false,
  },
  {
    label: "Customer",
    icon: HiOutlineUserGroup,
    route: "/admin/customers",
    hasChild: false,
  },
  // {
  //   label: "Tickets",
  //   icon: HiShoppingBag,
  //   route: "/organizer/tickets",
  //   hasChild: false,
  // },
  // {
  //   label: "Event",
  //   icon: HiTable,
  //   hasChild: true,
  //   children: [
  //     {
  //       label: "List Event",
  //       route: "/organizer/events/list",
  //     },
  //     {
  //       label: "Create Event",
  //       route: "/organizer/events/create",
  //     },
  //   ],
  // },

  // {
  //   label: "Invoices",
  //   icon: HiDocumentReport,
  //   route: "/organizer/invoices",
  //   hasChild: false,
  // },
];
