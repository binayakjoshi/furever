import Image from "next/image";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import NavLink from "./nav-link";
import Button from "../UI/button";
import logoImage from "@/assets/logo.png";
import classes from "./navigation-bar.module.css";

const NavigationBar = () => {
  return (
    <nav className={classes.navbar}>
      <ul className={classes.navList}>
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

        <li className={`${classes.navItem} ${classes.iconItem}`}>
          <Button className={classes.buttonWrapper}>
            <FaUserCircle size={30} color="#333" />
          </Button>
        </li>
      </ul>
    </nav>
  );
};

export default NavigationBar;
