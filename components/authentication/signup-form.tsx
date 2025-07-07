"use client";

import type React from "react";
import { useState, useCallback } from "react";

import { useRouter } from "next/navigation";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";

import Input from "@/components/custom-elements/input";
import Button from "../custom-elements/button";
import { useForm } from "@/lib/use-form";
import { useHttp } from "@/lib/request-hook";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
  VALIDATOR_NUMBER,
} from "@/lib/validators";
import ImageUpload from "../custom-elements/image-upload";
import styles from "./signup-form.module.css";
import ErrorModal from "../ui/error";

type SignupResponse = {
  success: boolean;
  message: string;
  data?: { userId: string; email: string; name: string; role: string };
};
const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const router = useRouter();
  const { isLoading, error, sendRequest, clearError } =
    useHttp<SignupResponse>();

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
      address: {
        value: "",
        isValid: false,
        touched: false,
      },
      phone: {
        value: "",
        isValid: false,
        touched: false,
      },

      profileImage: {
        value: undefined,
        isValid: false,
        touched: false,
      },
      dob: {
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
    if (!formState.isValid || isLoading) {
      return;
    }
    try {
      const requestData = new FormData();
      requestData.append("name", formState.inputs.name.value as string);
      requestData.append("email", formState.inputs.email.value as string);
      requestData.append("password", formState.inputs.password.value as string);
      requestData.append("address", formState.inputs.address.value as string);
      requestData.append("phone", formState.inputs.phone.value as string);
      requestData.append("dob", formState.inputs.dob.value as string);
      requestData.append(
        "profileImage",
        formState.inputs.profileImage.value as File
      );

      const res = await sendRequest("/api/auth/signup", "POST", requestData);
      if (res.success && res.data) {
        router.push("/login");
      }
    } catch (_) {}
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
    <>
      {error && <ErrorModal clearError={clearError} error={error} />}
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
          <Input
            id="phone"
            element="input"
            type="number"
            label="Phone Number"
            placeholder="Your Phone Number"
            validators={[
              VALIDATOR_REQUIRE(),
              VALIDATOR_NUMBER(),
              VALIDATOR_MINLENGTH(10),
            ]}
            errorText="Please enter a valid phone number"
            onInput={customInputHandler}
            className={styles.inputField}
          />
        </div>
        <div className={styles.fieldGroup}>
          <Input
            id="dob"
            element="input"
            type="date"
            label="Date of Birth"
            placeholder="date of birth"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid date"
            onInput={customInputHandler}
            className={styles.inputField}
          />
        </div>
        <div className={styles.fieldGroup}>
          <Input
            id="address"
            element="input"
            type="text"
            label="Address"
            placeholder="Your Address"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Address is required"
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
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
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
        <ImageUpload
          id="profileImage"
          center
          errorText="Please provide an image."
          onInput={inputHandler}
        />
        <Button
          type="submit"
          className={styles.submitButton}
          disabled={
            isLoading ||
            !formState.isValid ||
            !formState.inputs.name.value ||
            !formState.inputs.email.value ||
            !formState.inputs.password.value ||
            !formState.inputs.confirmPassword.value ||
            !passwordsMatch
          }
        >
          {isLoading ? (
            <>
              <FaSpinner className={styles.loadingIcon} size={20} />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </>
  );
};

export default SignupForm;
