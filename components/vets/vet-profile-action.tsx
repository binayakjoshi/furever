"use client";
import { FaTrash, FaPen } from "react-icons/fa";
import { useAuth } from "@/context/auth-context";
import Button from "../custom-elements/button";
import styles from "./vet-profile-action.module.css";

type VetProfileActionProps = {
  userId: string;
};
const VetProfileAction = ({ userId }: VetProfileActionProps) => {
  const { user } = useAuth();
  const handleApointment = () => {
    console.log("making apointment...");
  };
  if (userId === user?.userId)
    return (
      <div className={styles.actions}>
        <Button className={styles.editButton} href={`/vets/${userId}/edit`}>
          <span className={styles.buttonIcon}>
            <FaPen />
          </span>
          Edit Profile
        </Button>
        <Button className={styles.deleteButton} href={`/vets/${userId}/delete`}>
          <span className={styles.buttonIcon}>
            <FaTrash />
          </span>
          Delete Account
        </Button>
      </div>
    );
  return (
    <div className={styles.actions}>
      <Button onClick={handleApointment} className={styles.editButton}>
        Book Apointment
      </Button>
    </div>
  );
};
export default VetProfileAction;
