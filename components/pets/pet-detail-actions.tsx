"use client";
import { useRouter } from "next/navigation";
import Button from "../custom-elements/button";
import styles from "./pet-detail-actions.module.css";

type PetDetailActionProps = {
  petId: string;
};
const PetDetailAction = ({ petId }: PetDetailActionProps) => {
  const router = useRouter();
  return (
    <div className={styles.buttonGroup}>
      <Button
        className={styles.editButton}
        onClick={() => router.push(`/pets/${petId}/edit`)}
      >
        Edit
      </Button>
      <Button
        className={styles.removeButton}
        onClick={() => router.push(`/pets/${petId}/delete`)}
      >
        Remove
      </Button>
    </div>
  );
};
export default PetDetailAction;
