import classes from "./navigation-bar.module.css";
import NavActions from "./nav-actions";
import { NavigationLinks } from "./navigation-links";

const NavigationBar = () => {
  return (
    <nav className={classes.navbar}>
      <ul className={classes.navList}>
        <NavigationLinks />
        <li className={`${classes.navActionItem} ${classes.iconItem}`}>
          <NavActions />
        </li>
      </ul>
    </nav>
  );
};

export default NavigationBar;
