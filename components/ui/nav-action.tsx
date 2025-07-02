"use client";

import { useState } from "react";
import Link from "next/link";
import { FaUserCircle, FaPaw, FaPlus, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../context/auth-context";
import SideDrawer from "./side-drawer";
import Button from "../custom-elements/button";
import LoadingSpinner from "../ui/loading-spinner";
import classes from "./nav-actions.module.css";