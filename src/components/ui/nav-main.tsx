import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { useLocation } from "react-router-dom";

interface Props {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    hasChild?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}
export function NavMain({ items }: Props) {
  const { pathname } = useLocation();
  const pathnameSegments = pathname.split("/").slice(1);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActiveMenu = item.title.toLowerCase() == pathnameSegments[1];
          const isHasChild = item.hasChild;

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive ?? isActiveMenu}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  {isHasChild ? (
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <a href={item.url} className="w-full">
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </CollapsibleTrigger>
                {isHasChild && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={`${item.url}/${subItem.url}`}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
