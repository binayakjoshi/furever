"use client";

import React, { ReactNode } from "react";
import classes from "./side-drawer.module.css";

type SideDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: "left" | "right";
};

const SideDrawer = ({
  isOpen,
  onClose,
  children,
  position = "right",
}: SideDrawerProps) => {
  return (
    <>
      {isOpen && <div className={classes.backdrop} onClick={onClose} />}

      <aside
        className={`${classes.drawer} ${isOpen ? classes.open : ""} ${
          position === "left" ? classes.left : classes.right
        }`}
        role="navigation"
      >
        <button
          className={classes.closeBtn}
          onClick={onClose}
          aria-label="Close Menu"
        >
          &times;
        </button>
        <div className={classes.content}>{children}</div>
      </aside>
    </>
  );
};

export default SideDrawer;
