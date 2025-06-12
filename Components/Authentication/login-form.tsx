"use client";

import React, { useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useForm } from "@/lib/use-form";
import { Values } from "@/lib/validate";
import styles from "./login-form.module.css";

interface LoginFormProps {
  onSubmit: (values: { email: string; password: string }) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<Values>({ email: "", password: "" }, (vals) => {
    onSubmit(vals);
    router.push("/dashboard");
  });

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.fieldGroup}>
        <label htmlFor="email" className={styles.label}>
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@domain.com"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${styles.input} ${
            touched.email && errors.email ? styles.error : ""
          }`}
        />
        {touched.email && errors.email && (
          <div className={styles.errorMessage}>
            <FaExclamationCircle className={styles.errorIcon} /> {errors.email}
          </div>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <div className={styles.passwordContainer}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.passwordInput} ${
              touched.password && errors.password ? styles.error : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className={styles.passwordToggle}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {touched.password && errors.password && (
          <div className={styles.errorMessage}>
            <FaExclamationCircle className={styles.errorIcon} />{" "}
            {errors.password}
          </div>
        )}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={
          isSubmitting ||
          !values.email ||
          !values.password ||
          !!errors.email ||
          !!errors.password
        }
      >
        {isSubmitting ? (
          <FaSpinner className={styles.loadingIcon} />
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
