import React, { useState } from "react";
import styles from "./pill-toggle.module.css";

type Mode = "Pet Owner" | "Veterinarian";

export const TogglePill: React.FC<{
  onChange?: (mode: Mode) => void;
  initialMode?: Mode;
}> = ({ onChange, initialMode = "Pet Owner" }) => {
  const [mode, setMode] = useState<Mode>(initialMode);

  const handleToggle = () => {
    const next: Mode = mode === "Pet Owner" ? "Veterinarian" : "Pet Owner";
    setMode(next);
    onChange?.(next);
  };

  return (
    <div className={styles.pillToggle} onClick={handleToggle}>
      <div
        className={`${styles.pillOption} ${
          mode === "Pet Owner" ? styles.active : ""
        }`}
      >
        Pet Owner
      </div>
      <div
        className={`${styles.pillOption} ${
          mode === "Veterinarian" ? styles.active : ""
        }`}
      >
        Veterinarian
      </div>
    </div>
  );
};
