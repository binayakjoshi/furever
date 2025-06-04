"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import classes from "./nav-link.module.css";

type NavLinkProps = {
  href: string;
  children: ReactNode;
};
const NavLink = (props: NavLinkProps) => {
  const path = usePathname();
  return (
    <Link
      href={props.href}
      className={
        path.startsWith(props.href)
          ? `${classes.link} ${classes.active}`
          : classes.link
      }
    >
      {props.children}
    </Link>
  );
};
export default NavLink;
