"use client";

import type React from "react";
import { useState } from "react";

import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import Input from "@/Components/CustomElements/input";
import Button from "../CustomElements/button";
import { useForm } from "@/lib/use-form";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "@/lib/validators";
import styles from "./login-form.module.css";

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void> | void;
  isLoading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, inputHandler] = useForm(
    {
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
    },
    false
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formState.isValid || isSubmitting || isLoading) {
      return;
    }
    //needs to be implemented later on once backend is ready
    setIsSubmitting(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.fieldGroup}>
        <Input
          id="email"
          element="input"
          type="email"
          label="Email address"
          placeholder="you@domain.com"
          validators={[VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()]}
          errorText="Please enter a valid email address"
          onInput={inputHandler}
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
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(6)]}
            errorText="Password must be at least 6 characters long"
            onInput={inputHandler}
            className={styles.passwordField}
          />
          <Button
            type="Button"
            onClick={togglePasswordVisibility}
            className={styles.passwordToggle}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        className={styles.submitButton}
        disabled={
          isSubmitting ||
          isLoading ||
          !formState.isValid ||
          !formState.inputs.email.value ||
          !formState.inputs.password.value
        }
      >
        {isSubmitting || isLoading ? (
          <>
            <FaSpinner className={styles.loadingIcon} size={20} />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
