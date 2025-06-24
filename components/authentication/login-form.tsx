"use client";
import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import Input from "@/components/custom-elements/input";
import Button from "../custom-elements/button";
import { useForm } from "@/lib/use-form";
import { useAuth } from "@/context/auth-context";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "@/lib/validators";
import styles from "./login-form.module.css";

const LoginForm = () => {
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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

    if (!formState.isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formState.inputs.email.value,
          password: formState.inputs.password.value,
        }),
      });
      const resData = await res.json();

      if (!res.ok) {
        throw new Error("Login Failed Please try again later");
      }
      setIsSubmitting(false);
      setUser(resData.data);
      router.push("/");
    } catch (err) {
      setIsSubmitting(false);
      throw new Error("error while submitting data");
    }
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
          !formState.isValid ||
          !formState.inputs.email.value ||
          !formState.inputs.password.value
        }
      >
        {isSubmitting ? (
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
