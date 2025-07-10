"use client";
import { FaTrash, FaPen } from "react-icons/fa";
import { useAuth } from "@/context/auth-context";
import Button from "../custom-elements/button";
import styles from "./user-profile-action.module.css";

type UserProfileActionProps = {
  userId: string;
};
const UserProfileAction = ({ userId }: UserProfileActionProps) => {
  const { user } = useAuth();
  if (userId === user?.userId)
    return (
      <div className={styles.actions}>
        <Button className={styles.editButton} href={`/user/${userId}/edit`}>
          <span className={styles.buttonIcon}>
            <FaPen />
          </span>
          Edit Profile
        </Button>
        <Button className={styles.deleteButton} href={`/user/${userId}/delete`}>
          <span className={styles.buttonIcon}>
            <FaTrash />
          </span>
          Delete Account
        </Button>
      </div>
    );
  return null;
};
export default UserProfileAction;
