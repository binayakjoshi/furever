"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";

import Input from "@/Components/CustomElements/input";
import Button from "../CustomElements/button";
import { useForm } from "@/lib/use-form";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "@/lib/validators";

import styles from "./signup-form.module.css";

interface SignupFormProps {
  onSubmit?: (
    name: string,
    email: string,
    password: string
  ) => Promise<void> | void;
  isLoading?: boolean;
}

const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState("");

  const [formState, inputHandler] = useForm(
    {
      name: {
        value: "",
        isValid: false,
        touched: false,
      },
      email: {
        value: "",
        isValid: false,
        touched: false,
      },
      password: {
        value: "",
        isValid: false,
        touched: false,
      },
      confirmPassword: {
        value: "",
        isValid: false,
        touched: false,
      },
    },
    false
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const password = formState.inputs.password.value;
    const confirmPassword = formState.inputs.confirmPassword.value;

    if (password !== confirmPassword) {
      setPasswordMatchError("Passwords do not match");
      return;
    }

    setPasswordMatchError("");

    if (!formState.isValid || isSubmitting || isLoading) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(
          formState.inputs.name.value,
          formState.inputs.email.value,
          formState.inputs.password.value
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // Custom input handler=
  const customInputHandler = useCallback(
    (id: string, value: string, isValid: boolean) => {
      inputHandler(id, value, isValid);

      // Clear password match error when either password field changes
      if (id === "password" || id === "confirmPassword") {
        setPasswordMatchError("");
      }
    },
    [inputHandler]
  );

  const passwordsMatch =
    formState.inputs.password.value === formState.inputs.confirmPassword.value;
  const showPasswordMatchError =
    passwordMatchError ||
    (formState.inputs.confirmPassword.touched &&
      formState.inputs.confirmPassword.value &&
      !passwordsMatch);

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.fieldGroup}>
        <Input
          id="name"
          element="input"
          type="text"
          label="Full Name"
          placeholder="Enter your full name"
          validators={[VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(2)]}
          errorText="Name must be at least 2 characters long"
          onInput={customInputHandler}
          className={styles.inputField}
        />
      </div>

      <div className={styles.fieldGroup}>
        <Input
          id="email"
          element="input"
          type="email"
          label="Email address"
          placeholder="you@domain.com"
          validators={[VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()]}
          errorText="Please enter a valid email address"
          onInput={customInputHandler}
          className={styles.inputField}
        />
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.passwordContainer}>
          <Input
            id="password"
            element="input"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Enter your password"
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(8)]}
            errorText="Password must be at least 8 characters long"
            onInput={customInputHandler}
            className={styles.passwordField}
          />
          <Button
            type="button"
            onClick={togglePasswordVisibility}
            className={styles.passwordToggle}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </Button>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.passwordContainer}>
          <Input
            id="confirmPassword"
            element="input"
            type={showConfirmPassword ? "text" : "password"}
            label="Confirm Password"
            placeholder="Confirm your password"
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(8)]}
            errorText="Please confirm your password"
            onInput={customInputHandler}
            className={styles.passwordField}
          />
          <Button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className={styles.passwordToggle}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <FaEyeSlash size={20} />
            ) : (
              <FaEye size={20} />
            )}
          </Button>
        </div>
        {showPasswordMatchError && (
          <p className={styles.errorText}>
            {passwordMatchError || "Passwords do not match"}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className={styles.submitButton}
        disabled={
          isSubmitting ||
          isLoading ||
          !formState.isValid ||
          !formState.inputs.name.value ||
          !formState.inputs.email.value ||
          !formState.inputs.password.value ||
          !formState.inputs.confirmPassword.value ||
          !passwordsMatch
        }
      >
        {isSubmitting || isLoading ? (
          <>
            <FaSpinner className={styles.loadingIcon} size={20} />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
};

export default SignupForm;
