import {
  //   HiArrowSmRight,
  HiChartPie,
  //   HiInbox,
  HiShoppingBag,
  HiTable,
  HiDocumentReport,
} from "react-icons/hi";

export const sidebarOrganizer = [
  {
    label: "Dashboard",
    icon: HiChartPie,
    route: "/organizer/dashboard",
    hasChild: false,
  },
  {
    label: "Events",
    icon: HiTable,
    route: "/organizer/events",
    hasChild: false,
  },
  {
    label: "Tickets",
    icon: HiShoppingBag,
    route: "/organizer/tickets",
    hasChild: false,
  },
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

  {
    label: "Invoices",
    icon: HiDocumentReport,
    route: "/organizer/invoices",
    hasChild: false,
  },
];
