"use client";

import type React from "react";
import { useState, useCallback } from "react";

import { useRouter } from "next/navigation";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";

import Input from "@/components/custom-elements/input";
import Button from "../custom-elements/button";
import { useForm } from "@/lib/use-form";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "@/lib/validators";

import styles from "./signup-form.module.css";

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const router = useRouter();
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
    if (!formState.isValid || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.inputs.name.value,
          email: formState.inputs.email.value,
          password: formState.inputs.password.value,
          role: "user",
        }),
      });
      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        throw new Error("Login Failed Please try again later");
      }
      setIsSubmitting(false);
      router.push("/");
    } catch (err) {
      setIsSubmitting(false);
      throw new Error("error while submitting data");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const customInputHandler = useCallback(
    (id: string, value: string, isValid: boolean) => {
      inputHandler(id, value, isValid);

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
          !formState.isValid ||
          !formState.inputs.name.value ||
          !formState.inputs.email.value ||
          !formState.inputs.password.value ||
          !formState.inputs.confirmPassword.value ||
          !passwordsMatch
        }
      >
        {isSubmitting ? (
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
