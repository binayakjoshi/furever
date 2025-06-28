"use client";
import { FaExclamation, FaTimes } from "react-icons/fa";
import Button from "@/components/custom-elements/button";
import Modal from "@/components/ui/modal";
import styles from "./error.module.css";

type ErrorProps = {
  error: {
    title?: string;
    message: string;
  };
  zIndex?: number;
  clearError: () => void;
};

const ErrorModal = ({ error, clearError, zIndex }: ErrorProps) => {
  return (
    <Modal zIndex={zIndex}>
      <div className={styles.errorCard}>
        <Button
          aria-label="Close"
          className={styles.closeIcon}
          onClick={clearError}
        >
          <FaTimes />
        </Button>
        <div className={styles.content}>
          <h3 className={styles.title}>
            {error.title ?? "An error has occurred"}{" "}
            <FaExclamation className={styles.warningIcon} />
          </h3>
          <p className={styles.message}>{error.message}</p>
        </div>
      </div>
    </Modal>
  );
};
export default ErrorModal;
