import React from "react";
import styles from "./loading-spinner.module.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  variant?: "primary" | "pulse" | "dots" | "bars" | "orbit";
  color?: string;
  text?: string;
  fullScreen?: boolean;
  inline?: boolean;
}

const LoadingSpinner = ({
  inline = false,
  size = "medium",
  variant = "primary",
  color,
  text = "Loading...",
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const sizeClass = styles[size];
  const containerClass = inline
    ? styles.inlineContainer
    : fullScreen
    ? styles.fullScreen
    : styles.container;
  const renderSpinner = () => {
    switch (variant) {
      case "pulse":
        return <div className={`${styles.spinnerPulse} ${sizeClass}`} />;

      case "dots":
        return (
          <div className={`${styles.spinnerDots} ${sizeClass}`}>
            <div className={styles.dot} />
            <div className={styles.dot} />
            <div className={styles.dot} />
          </div>
        );

      case "bars":
        return (
          <div className={`${styles.spinnerBars} ${sizeClass}`}>
            <div className={styles.bar} />
            <div className={styles.bar} />
            <div className={styles.bar} />
            <div className={styles.bar} />
            <div className={styles.bar} />
          </div>
        );

      case "orbit":
        return <div className={`${styles.spinnerOrbit} ${sizeClass}`} />;

      default:
        return <div className={`${styles.spinnerPrimary} ${sizeClass}`} />;
    }
  };

  return (
    <div
      className={containerClass}
      style={
        color
          ? ({ "--spinner-color": color } as React.CSSProperties)
          : undefined
      }
    >
      <div className={styles.spinnerWrapper}>
        {renderSpinner()}
        {text && <div className={styles.loadingText}>{text}</div>}
      </div>
    </div>
  );
};

export default LoadingSpinner;