"use client";
import { useRouter } from "next/navigation";
import { FaRedo, FaExclamation } from "react-icons/fa";
import Button from "@/components/custom-elements/button";
import Modal from "@/components/ui/modal";
import styles from "./error.module.css";

type ErrorProps = {
  error: {
    message: string;
  };
};

const Error = ({ error }: ErrorProps) => {
  const router = useRouter();
  const handleRetry = () => {
    window.location.reload();
  };
  return (
    <Modal>
      <div className={styles.errorCard}>
        <div className={styles.content}>
          <h3 className={styles.title}>
            {" "}
            An error occurred <FaExclamation className={styles.warningIcon} />
          </h3>
          <p className={styles.message}>{error.message}</p>
        </div>
        <div className={styles.buttonGroup}>
          <Button onClick={handleRetry} className={styles.tryagainButton}>
            Try again <FaRedo className={styles.buttonIcon} />
          </Button>
          <Button onClick={() => router.back()} className={styles.closeButton}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default Error;
