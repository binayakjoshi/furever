"use client";
import { useRouter, useParams } from "next/navigation";
import { FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";
import { useHttp } from "@/lib/request-hook";
import Modal from "@/components/ui/modal";
import Button from "@/components/custom-elements/button";
import styles from "./page.module.css";
import ErrorModal from "@/components/ui/error";

import LoadingSpinner from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";

type VetDeletRespnse = {
  success: boolean;
  message: string;
};
const VetDeletePage = () => {
  const router = useRouter();
  const params = useParams();
  const { setUser } = useAuth();
  const { vetId } = params;
  const { isLoading, sendRequest, error, clearError } =
    useHttp<VetDeletRespnse>();

  const deleteHandler = async () => {
    try {
      const res = await sendRequest(`/api/vets/${vetId}`, "DELETE");
      if (res.success) {
        setUser(null);
        router.push("/login");
      }
    } catch {}
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
              Delete User Account
            </h3>
            <p className={styles.message}>
              Are you sure you want to delete this Account? This action cannot
              be undone and all data realated to it will be permanently deleted.
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
                Delete Account
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default VetDeletePage;
