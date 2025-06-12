"use client";
import { useState } from "react";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import NavLink from "./nav-link";
import { useAuth } from "../../context/auth-context";
import SideDrawer from "./side-drawer";
import Button from "../UI/button";
import classes from "./nav-actions.module.css";

const NavActions = () => {
  const { isLoggedIn } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const toggleDrawer = () => setDrawerOpen((p) => !p);

  if (!isLoggedIn)
    return (
      <>
        <NavLink href="/login">Login</NavLink>
        <NavLink href="/signup">Sign Up</NavLink>
      </>
    );

  return (
    <>
      <Button
        className={classes.buttonWrapper}
        onClick={toggleDrawer}
        aria-label="Open Menu"
      >
        <FaUserCircle size={30} color="#333" />
      </Button>
      <SideDrawer isOpen={drawerOpen} onClose={toggleDrawer}>
        <nav className={classes.nav}>
          <ul>
            <li>
              <Link href="/user/slug" onClick={toggleDrawer}>
                {/*the link will be dynamic once auth is handled with backend */}
                <FaUserCircle size={15} /> Your Profile
              </Link>
            </li>
            <li>
              <Link href="/pets/" onClick={toggleDrawer}>
                Your Pet Profile
              </Link>
            </li>
          </ul>
        </nav>
      </SideDrawer>
    </>
  );
};
export default NavActions;
