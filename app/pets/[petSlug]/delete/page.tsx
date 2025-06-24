"use client";
import { useRouter, useParams } from "next/navigation";
import Modal from "@/components/ui/modal";
import Button from "@/components/custom-elements/button";
import { FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";
import styles from "./page.module.css";

const PetDeletePage = () => {
  const router = useRouter();
  const params = useParams();
  const petSlug = params.petSlug;

  const deleteHandler = async () => {
    try {
      const res = await fetch(`/api/pets/${petSlug}/delete`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("failed to delete pet");
      }
      router.push("/");
    } catch (error) {
      console.log(error);
      throw new Error("something went wrong");
    }
  };

  return (
    <>
      <Modal>
        <div className={styles.deleteCard}>
          <div className={styles.content}>
            <h3 className={styles.title}>
              <div className={styles.iconContainer}>
                <FaExclamationTriangle className={styles.warningIcon} />
              </div>
              Delete Pet
            </h3>
            <p className={styles.message}>
              Are you sure you want to remove this pet? This action cannot be
              undone and all pet data will be permanently deleted.
            </p>
          </div>

          <div className={styles.buttonContainer}>
            <Button
              onClick={() => router.back()}
              className={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button onClick={deleteHandler} className={styles.deleteButton}>
              <FaTrashAlt className={styles.buttonIcon} />
              Delete Pet
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PetDeletePage;
