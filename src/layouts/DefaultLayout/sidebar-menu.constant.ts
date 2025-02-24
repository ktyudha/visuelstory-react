import {
  AudioWaveform,
  // BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  // Settings2,
  // SquareTerminal,
  Image,
  Globe,
  User,
} from "lucide-react";

export const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Bot,
    },
    {
      title: "Account",
      url: "/admin/account",
      icon: User,
    },
    {
      title: "Platform",
      url: "/admin/platform",
      icon: Globe,
      hasChild: true,
      items: [
        {
          title: "About",
          url: "about",
        },
        {
          title: "Contact",
          url: "contact",
        },
        {
          title: "Pricelist",
          url: "investment",
        },
      ],
    },
    {
      title: "Portfolio",
      url: "/admin/portfolio",
      icon: Image,
      hasChild: true,
      items: [
        {
          title: "Engagement",
          url: "engagement",
        },
        {
          title: "Couple Session",
          url: "couple-session",
        },
        {
          title: "Wedding",
          url: "wedding",
        },
      ],
    },
    // {
    //   title: "Payload",
    //   url: "/dashboard",
    //   icon: SquareTerminal,
    //   isActive: true,
    //   hasSubItems: true,
    //   items: [
    //     {
    //       title: "Dashboard",
    //       url: "dashboard",
    //     },
    //     {
    //       title: "Starred",
    //       url: "#",
    //     },
    //     {
    //       title: "Settings",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: BookOpen,
    //   hasSubItems: true,
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   hasSubItems: true,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};
