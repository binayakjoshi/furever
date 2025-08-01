import { FaCalendarAlt, FaHeart, FaPlusCircle } from "react-icons/fa";

import Button from "../custom-elements/button";
import styles from "./dashboard-action.module.css";
const DashboardAction = () => {
  return (
    <section className={styles.dasActions}>
      <Button href="/pets/addpet" className={styles.dasActionsBtn}>
        <FaPlusCircle /> Add New Pet
      </Button>
      <Button className={styles.dasActionsBtn} href="/vets">
        <FaCalendarAlt /> Book Appointment
      </Button>
      <Button href="/adoption/add" className={styles.dasActionsBtn}>
        <FaHeart /> Post for Adoption
      </Button>
    </section>
  );
};
export default DashboardAction;
