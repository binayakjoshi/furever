"use client";
import { FaTrash, FaPen } from "react-icons/fa";
import { useAuth } from "@/context/auth-context";
import Button from "../custom-elements/button";
import styles from "./pet-owner-profile-action.module.css";

type PetOwnerProfileActionProps = {
  userId: string;
};
const PetOwnerProfileAction = ({ userId }: PetOwnerProfileActionProps) => {
  const { user } = useAuth();
  if (userId === user?.userId)
    return (
      <div className={styles.actions}>
        <Button
          className={styles.editButton}
          href={`/pet-owners/${userId}/edit`}
        >
          <span className={styles.buttonIcon}>
            <FaPen />
          </span>
          Edit Profile
        </Button>
        <Button
          className={styles.deleteButton}
          href={`/pet-owners/${userId}/delete`}
        >
          <span className={styles.buttonIcon}>
            <FaTrash />
          </span>
          Delete Account
        </Button>
      </div>
    );
  return null;
};
export default PetOwnerProfileAction;
