"use client";
import Image from "next/image";
import Link from "next/link";
import NavLink from "./nav-link";
import logoImage from "@/assets/logo.png";
import SideDrawer from "./side-drawer";
import { FaBars } from "react-icons/fa";
import Button from "../custom-elements/button";
import classes from "./navigation-links.module.css";
import { useState } from "react";

export const NavigationLinks = () => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const toggleDrawer = () => setDrawerOpen((p) => !p);

  return (
    <>
      <Button
        className={classes.hamburgerBtn}
        onClick={toggleDrawer}
        aria-label="Menu"
      >
        <FaBars size={24} />
      </Button>
      <SideDrawer position="left" isOpen={drawerOpen} onClose={toggleDrawer}>
        <nav className={classes.sideDrawerNav}>
          <ul>
            <li>
              <NavLink href="/contacts">Contacts</NavLink>
            </li>
            <li>
              <NavLink href="/about">About Us</NavLink>
            </li>
            <li>
              <NavLink href="/adoption">Adoption</NavLink>
            </li>
            <li>
              <NavLink href="/vets/nearby">Nearby Hospitals</NavLink>
            </li>
            <li>
              <NavLink href="/vets">Available Doctors</NavLink>
            </li>
            <li>
              <NavLink href="/pet-forum">Pet Forum</NavLink>
            </li>
            <li>
              <NavLink href="/lost-found">Lost and Found</NavLink>
            </li>
          </ul>
        </nav>
      </SideDrawer>
      <li className={classes.navItem}>
        <Link href="/" className={classes.logo}>
          <Image src={logoImage.src} alt="App Logo" width={50} height={50} />
        </Link>
      </li>
      <li className={classes.navItem}>
        <NavLink href="/contacts">Contacts</NavLink>
      </li>
      <li className={classes.navItem}>
        <NavLink href="/about">About Us</NavLink>
      </li>
      <li className={classes.navItem}>
        <NavLink href="/adoption">Adoption</NavLink>
      </li>
      <li className={classes.navItem}>
        <NavLink href="/vets/nearby">Nearby Hospitals</NavLink>
      </li>
      <li className={classes.navItem}>
        <NavLink href="/vets/">Available Doctors</NavLink>
      </li>
      <li className={classes.navItem}>
        <NavLink href="/pet-forum">Pet Forum</NavLink>
      </li>
      <li className={classes.navItem}>
        <NavLink href="/lost-found">Lost/Found</NavLink>
      </li>
    </>
  );
};
