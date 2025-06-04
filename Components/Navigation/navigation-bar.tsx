import NavLink from "./nav-link";
import classes from "./navigation-bar.module.css";
import { FaUserCircle } from "react-icons/fa";
import Button from "./UI/button";

const NavigationBar = () => {
  return (
    <nav className={classes.navbar}>
      <ul className={classes.navList}>
        <li className={classes.navItem}>
          <NavLink href="/">FUREVER</NavLink>
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
