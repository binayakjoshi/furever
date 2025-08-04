"use client";
import { useState } from "react";
import { FaTrash, FaPen, FaTimes, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "@/context/auth-context";
import { useHttp } from "@/lib/request-hook";
import Modal from "../ui/modal";
import LoadingSpinner from "../ui/loading-spinner";
import ErrorModal from "../ui/error";
import Button from "../custom-elements/button";
import styles from "./vet-profile-action.module.css";

type VetProfileActionProps = {
  userId: string;
};
type VetAppointmentResponse = {
  success: boolean;
};
const VetProfileAction = ({ userId }: VetProfileActionProps) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState<boolean>(false);
  const { isLoading, sendRequest, error, clearError } =
    useHttp<VetAppointmentResponse>();

  const handleApointment = async () => {
    try {
      const res = await sendRequest(`/api/vets/${userId}`, "POST", null, {
        "Content-Type": "application/json",
      });
      if (res?.success) {
        setShowModal(true);
      }
    } catch {}
  };
  const closeModal = () => {
    setShowModal(false);
    clearError();
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
    <>
      {error && <ErrorModal error={error} clearError={clearError} />}
      {showModal && (
        <Modal>
          <div className={styles.modalInner}>
            <button
              className={styles.modalClose}
              onClick={closeModal}
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className={styles.modalHeader}>
              <FaCheckCircle className={styles.modalIcon} />
              <h2>Interest Sent!</h2>
            </div>

            <div className={styles.modalBody}>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <p>
                  We’ve notified Doctor&apos;s office. They’ll reach out soon!
                </p>
              )}
            </div>

            <div className={styles.modalFooter}>
              <Button onClick={closeModal}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
      <div className={styles.actions}>
        <Button onClick={handleApointment} className={styles.editButton}>
          Book Apointment
        </Button>
      </div>
    </>
  );
};
export default VetProfileAction;
