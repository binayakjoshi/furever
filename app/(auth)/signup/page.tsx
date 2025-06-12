"use client";

import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import SignupForm from "@/Components/Authentication/signup-form";
import styles from "./signup.module.css";

const LoginPage = () => {
  const handleLogin = (data: { email: string; password: string }) => {
    console.log("Logging in with", data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Sign in to your account</h2>
            <p className={styles.cardDescription}>
              Enter your credentials to access your Furever account
            </p>
          </div>
          <div className={styles.cardContent}>
            <SignupForm onSubmit={handleLogin} />

            <div className={styles.linksContainer}>
              <Link href="/forgot-password" className={styles.forgotLink}>
                Forgot your password?
              </Link>

              <div className={styles.divider}>
                <div className={styles.dividerLine}>
                  <span className={styles.dividerBorder} />
                </div>
                <div className={styles.dividerText}>New to Furever?</div>
              </div>

              <Link href="/signup" className={styles.signupButton}>
                <FaHeart className={styles.signupIcon} /> Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
