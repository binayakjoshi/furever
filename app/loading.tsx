import React from "react";
import styles from "./loading.module.css";

const Loading = () => {
  return (
    <div className={styles.container}>
      <div className={styles.spinnerWrapper}>
        <div className={`${styles.spinnerPrimary} ${styles.medium}`} />
        <div className={styles.loadingText}>Loading...</div>
      </div>
    </div>
  );
};

export default Loading;
