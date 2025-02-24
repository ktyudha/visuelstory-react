import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import * as React from "react";
import clsx from "clsx";
import { useLocation } from "react-router-dom";

interface Props {
  breadcrumbs: {
    title: string;
    url: string;
    isActive?: boolean;
    hasChild?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}

export default function BreadCrumb({ breadcrumbs }: Props) {
  const { pathname } = useLocation();
  const pathnameSegments = pathname.split("/").slice(1);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className={`hidden md:block`}>
          <BreadcrumbLink href="/admin">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs?.map((breadcrumb, idx) => {
          const number = idx + 1;
          // const isLast = breadcrumbs.length === number;
          const url = breadcrumb.url.split("/").slice(1);
          const isActiveMenu = pathnameSegments[1] === url[1];

          return (
            isActiveMenu && (
              <React.Fragment key={`breadcrumb-${number}`}>
                {isActiveMenu && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}
                <>
                  <BreadcrumbItem
                    className={clsx([breadcrumb.hasChild && `hidden md:block`])}
                  >
                    {breadcrumb.hasChild ? (
                      <BreadcrumbLink
                        href={`${breadcrumb.url}/${pathnameSegments[2]}`}
                      >
                        {breadcrumb.title}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>

                  {breadcrumb.hasChild &&
                    breadcrumb.items?.map((brcrmb, _idx) => {
                      const isActiveSubMenu =
                        pathnameSegments[2] === brcrmb.url;
                      return (
                        isActiveSubMenu && (
                          <React.Fragment
                            key={`sub-breadcrumb-${number}-${_idx}`}
                          >
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                              <BreadcrumbPage>{brcrmb.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                          </React.Fragment>
                        )
                      );
                    })}
                </>
              </React.Fragment>
            )
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
