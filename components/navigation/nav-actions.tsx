"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    return <LoadingSpinner inline variant="bars" size="small" text="" />;
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
        {user.profileImage ? (
          <Image
            key={user.profileImage.url}
            src={user.profileImage.url}
            alt="profile Picture"
            width={40}
            height={40}
            className={classes.avatarImg}
          />
        ) : (
          <FaUserCircle size={24} color="#374151" />
        )}
      </Button>

      <SideDrawer isOpen={drawerOpen} onClose={toggleDrawer}>
        <div className={classes.userInfo}>
          <div className={classes.userAvatar}>
            {user.profileImage ? (
              <Image
                src={user.profileImage.url}
                alt="profile Picture"
                width={40}
                height={40}
                className={classes.avatarImg}
              />
            ) : (
              <FaUserCircle size={24} color="#374151" />
            )}
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
                href={`/adoption/my-post`}
                onClick={toggleDrawer}
                title="Manage your pets"
              >
                <FaPaw size={16} />
                My Adoption Posts
              </Link>
            </li>
            <li>
              <Link
                href={`/adoption/add`}
                onClick={toggleDrawer}
                title="Manage your pets"
              >
                <FaPlus size={16} />
                Post for Adoption
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
