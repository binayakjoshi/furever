"use client";

import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import SignupForm from "@/Components/Authentication/signup-form";
import styles from "./signup.module.css";

const SignupPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Signup to create a new account</h2>
            <p className={styles.cardDescription}>
              Enter your credentials to create your Furever account
            </p>
          </div>
          <div className={styles.cardContent}>
            <SignupForm />

            <div className={styles.linksContainer}>
              <div className={styles.divider}>
                <div className={styles.dividerLine}>
                  <span className={styles.dividerBorder} />
                </div>
                <div className={styles.dividerText}>
                  Already have an Account?
                </div>
              </div>

              <Link href="/login" className={styles.loginButton}>
                Login
                <FaHeart className={styles.loginIcon} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SignupPage;
