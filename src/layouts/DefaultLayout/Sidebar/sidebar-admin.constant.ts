import {
  //   HiArrowSmRight,
  HiOutlineHome,
  HiOutlineCalendar,
  //   HiInbox,
  // HiShoppingBag,
  HiOutlineMenu,
  HiOutlineDocumentText,
} from "react-icons/hi";

export const sidebarOrganizer = [
  {
    label: "Dashboard",
    icon: HiOutlineHome,
    route: "/admin/dashboard",
    hasChild: false,
  },
  {
    label: "Package",
    icon: HiOutlineMenu,
    hasChild: true,
    children: [
      {
        label: "Category",
        route: "/admin/package-categories",
      },
      {
        label: "Add On",
        route: "/admin/package-addons",
      },
      {
        label: "List Package",
        route: "/admin/packages",
      },
    ],
  },
  {
    label: "Invoices",
    icon: HiOutlineDocumentText,
    route: "/admin/invoices",
    hasChild: false,
  },
  {
    label: "Events",
    icon: HiOutlineCalendar,
    route: "/admin/events",
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
