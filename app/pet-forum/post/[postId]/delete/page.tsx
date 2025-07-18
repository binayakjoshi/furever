"use client";
import { useRouter, useParams } from "next/navigation";
import { FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";
import { useHttp } from "@/lib/request-hook";
import { type AdoptionPet } from "@/lib/types";
import Modal from "@/components/ui/modal";
import Button from "@/components/custom-elements/button";
import styles from "./page.module.css";
import ErrorModal from "@/components/ui/error";

import LoadingSpinner from "@/components/ui/loading-spinner";

type AdoptionPetRespnse = {
  success: boolean;
  message: string;
  data: AdoptionPet;
};
const ForumPostDeletePage = () => {
  const router = useRouter();
  const params = useParams();
  const { postId } = params;
  const { isLoading, sendRequest, error, clearError } =
    useHttp<AdoptionPetRespnse>();

  const deleteHandler = async () => {
    try {
      const res = await sendRequest(`/api/forum/${postId}`, "DELETE");
      if (res.success) {
        router.push("/pet-forum");
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
              Delete Forum Post
            </h3>
            <p className={styles.message}>
              Are you sure you want to delete this forum post? This action
              cannot be undone and all data realated to it will be permanently
              deleted.
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
                Delete Post
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ForumPostDeletePage;
