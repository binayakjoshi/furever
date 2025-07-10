"use client";
import { useRouter } from "next/navigation";
import Button from "../custom-elements/button";
import styles from "./pet-detail-actions.module.css";
import { useAuth } from "@/context/auth-context";
import { Pet } from "@/lib/types";

type PetDetailActionProps = {
  pet: Pet;
};
const PetDetailAction = ({ pet }: PetDetailActionProps) => {
  const { user } = useAuth();
  const router = useRouter();

  if (user?.userId === pet.user?._id) {
    return (
      <div className={styles.buttonGroup}>
        <Button
          className={styles.editButton}
          onClick={() => router.push(`/pets/${pet._id}/edit`)}
        >
          Edit
        </Button>
        <Button
          className={styles.removeButton}
          onClick={() => router.push(`/pets/${pet._id}/delete`)}
        >
          Remove
        </Button>
      </div>
    );
  }
  return null;
};
export default PetDetailAction;
