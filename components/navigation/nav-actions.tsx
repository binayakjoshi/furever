"use client";

import { useState } from "react";
import Link from "next/link";
import { FaUserCircle, FaPaw, FaPlus, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/auth-context";
import SideDrawer from "./side-drawer";
import Button from "../custom-elements/button";
import LoadingSpinner from "../ui/loading-spinner";
import classes from "./nav-actions.module.css";

const NavActions = () => {
  const { user, logout, loading } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const toggleDrawer = () => setDrawerOpen((p) => !p);

  if (loading) {
    return <LoadingSpinner variant="bars" size="small" text="" />;
  }

  if (!user) {
    return (
      <div className={classes.authButtons}>
        <Link href="/login" className={classes.loginButton}>
          Login
        </Link>
        <Link href="/signup" className={classes.signupButton}>
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <>
      <Button
        className={classes.buttonWrapper}
        onClick={toggleDrawer}
        aria-label="Open user menu"
        title="Open user menu"
      >
        <FaUserCircle size={24} color="#374151" />
      </Button>

      <SideDrawer isOpen={drawerOpen} onClose={toggleDrawer}>
        <div className={classes.userInfo}>
          <div className={classes.userAvatar}>
            <FaUserCircle size={32} color="#6b7280" />
          </div>
          <div className={classes.userDetails}>
            <h3>{user.name || "User"}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        <div className={classes.separator}></div>

        <nav className={classes.nav}>
          <ul>
            <li>
              <Link
                href={`/user/${user.userId}`}
                onClick={toggleDrawer}
                title="View your profile"
              >
                <FaUserCircle size={16} />
                Your Profile
              </Link>
            </li>
            <li>
              <Link
                href={`/user/${user.userId}/pets`}
                onClick={toggleDrawer}
                title="Manage your pets"
              >
                <FaPaw size={16} />
                Your Pet Profile
              </Link>
            </li>
            <li>
              <Link
                href="/pets/addpet"
                onClick={toggleDrawer}
                title="Add a new pet"
              >
                <FaPlus size={16} />
                Add Pet
              </Link>
            </li>
          </ul>
        </nav>

        <div className={classes.separator}></div>

        <button
          className={classes.logoutButton}
          onClick={() => {
            logout();
            toggleDrawer();
          }}
          title="Sign out of your account"
        >
          <FaSignOutAlt size={16} />
          Logout
        </button>
      </SideDrawer>
    </>
  );
};

export default NavActions;
