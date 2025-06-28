"use client";
import { useRouter, useParams } from "next/navigation";
import { FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";
import { useHttp } from "@/lib/request-hook";
import { type Pet } from "@/components/pets/pet-type";
import Modal from "@/components/ui/modal";
import Button from "@/components/custom-elements/button";
import styles from "./page.module.css";
import { useAuth } from "@/context/auth-context";
import ErrorModal from "@/components/ui/error";

import LoadingSpinner from "@/components/ui/loading-spinner";

type petDetailResponse = {
  success: boolean;
  message: string;
  data: Pet;
};
const PetDeletePage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const petSlug = params.petSlug;
  const { isLoading, sendRequest, error, clearError } =
    useHttp<petDetailResponse>();

  const deleteHandler = async () => {
    try {
      const res = await sendRequest(`/api/pets/${petSlug}/delete`, "DELETE");
      if (res.success && res.data) {
        router.push(`/user/${user?.userId}/pets`);
      }
    } catch (_) {}
  };

  return (
    <>
      {error && (
        <ErrorModal error={error} clearError={clearError} zIndex={2000} />
      )}
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
          {isLoading ? (
            <LoadingSpinner variant="bars" size="small" text="deleting..." />
          ) : (
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
          )}
        </div>
      </Modal>
    </>
  );
};

export default PetDeletePage;
