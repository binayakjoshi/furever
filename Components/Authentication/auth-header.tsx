import Image from "next/image";
import logoImage from "@/assets/logo.png";
import styles from "./auth-header.module.css";

const AuthHeader = () => {
  return (
    <div className={styles.header}>
      <div className={styles.brandContainer}>
        <Image
          src={logoImage}
          alt="app logo"
          width={32}
          height={32}
          className={styles.brandIconSvg}
        />

        <h1 className={styles.brandTitle}>Furever</h1>
      </div>
      <p className={styles.brandSubtitle}>
        Welcome back to your pets health journey
      </p>
    </div>
  );
};
export default AuthHeader;
