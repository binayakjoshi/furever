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
import styles from "./signup-form.module.css";

type SignupFormProps = {
  onSubmit: (values: {
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
  }) => void;
};

const SignupForm = ({ onSubmit }: SignupFormProps) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<Values>(
    { email: "", name: "", password: "", confirmPassword: "" },
    (vals) => {
      //onSubmit(vals);
      router.push("/");
    }
  );

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {/* Name */}
      <div className={styles.fieldGroup}>
        <label htmlFor="name" className={styles.label}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Your name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${styles.input} ${
            touched.name && errors.name ? styles.error : ""
          }`}
        />
        {touched.name && errors.name && (
          <div className={styles.errorMessage}>
            <FaExclamationCircle className={styles.errorIcon} /> {errors.name}
          </div>
        )}
      </div>

      {/* Email */}
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

      {/* Password */}
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
            aria-label="Toggle password visibility"
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

      {/* Confirm Password */}
      <div className={styles.fieldGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>
          Confirm Password
        </label>
        <div className={styles.passwordContainer}>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.passwordInput} ${
              touched.confirmPassword && errors.confirmPassword
                ? styles.error
                : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className={styles.passwordToggle}
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {touched.confirmPassword && errors.confirmPassword && (
          <div className={styles.errorMessage}>
            <FaExclamationCircle className={styles.errorIcon} />{" "}
            {errors.confirmPassword}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className={styles.submitButton}
        disabled={
          isSubmitting ||
          !values.email ||
          !values.name ||
          !values.password ||
          !values.confirmPassword ||
          !!errors.email ||
          !!errors.name ||
          !!errors.password ||
          !!errors.confirmPassword
        }
      >
        {isSubmitting ? (
          <FaSpinner className={styles.loadingIcon} />
        ) : (
          "Sign up"
        )}
      </button>
    </form>
  );
};

export default SignupForm;
