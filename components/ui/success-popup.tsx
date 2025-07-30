"use client";
import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import styles from "./success-popup.module.css";

interface SuccessPopupProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const SuccessPopup = ({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 
}: SuccessPopupProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div className={`${styles.popup} ${isVisible ? styles.show : styles.hide}`}>
      <div className={styles.content}>
        <FaCheckCircle className={styles.icon} />
        <span className={styles.message}>{message}</span>
      </div>
    </div>
  );
};

export default SuccessPopup; 