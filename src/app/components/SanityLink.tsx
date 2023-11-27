"use client";

import Link from "next/link";
import React, { Ref } from "react";
import { usePathname } from "next/navigation";
import { LinkData } from "~/types";
import { MinimalDocForPath } from "@tinloof/js-toolkit";
import { getLinkProps } from "~/routing/urls";

export interface SanityLinkProps {
  link: LinkData | MinimalDocForPath;
  elProps?: Partial<
    React.DetailedHTMLProps<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >
  >;
}

// eslint-disable-next-line
export const SanityLink = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithChildren<SanityLinkProps>
>((props, ref) => {
  const pathname = usePathname();
  if (!props.link) {
    return <span {...props.elProps}>{props.children}</span>;
  }

  const link =
    "linkType" in props.link
      ? props.link
      : ({
          linkType: "internal",
          pageLink: props.link,
        } as LinkData);

  const linkProps = getLinkProps(link, pathname);
  if (!linkProps) {
    return <span {...props.elProps}>{props.children}</span>;
  }

  if (link.linkType === "external") {
    return (
      <a ref={ref} {...linkProps} {...props.elProps} tabIndex={0}>
        {props.children}
      </a>
    );
  }

  return (
    <Link
      {...linkProps}
      ref={ref as any}
      {...linkProps}
      {...props.elProps}
      tabIndex={0}
    >
      {props.children}
    </Link>
  );
});
