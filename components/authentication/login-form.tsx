"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import Input from "@/components/custom-elements/input";
import Button from "../custom-elements/button";
import { useForm } from "@/lib/use-form";
import { useAuth } from "@/context/auth-context";
import { useHttp } from "@/lib/request-hook";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "@/lib/validators";
import styles from "./login-form.module.css";
import ErrorModal from "../ui/error";

type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    name: string;
    role: string;
    email: string;
    profileImage: { url: string };
  };
};

const LoginForm = () => {
  const { setUser } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, error, sendRequest, clearError } =
    useHttp<LoginResponse>();

  const [formState, inputHandler] = useForm(
    {
      email: { value: "", isValid: false, touched: false },
      password: { value: "", isValid: false, touched: false },
    },
    false
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formState.isValid || isLoading) return;

    try {
      const response = await sendRequest(
        "/api/auth/login",
        "POST",
        JSON.stringify({
          email: formState.inputs.email.value,
          password: formState.inputs.password.value,
        }),
        { "Content-Type": "application/json" }
      );

      if (response.success && response.data) {
        setUser(response.data);
        router.push("/");
      }
    } catch (_) {}
  };

  const isFormValid =
    formState.isValid &&
    formState.inputs.email.value &&
    formState.inputs.password.value;

  return (
    <>
      {error && <ErrorModal error={error} clearError={clearError} />}
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.fieldGroup}>
            <Input
              id="email"
              element="input"
              type="email"
              placeholder="you@example.com"
              label="Email"
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
                label="Paswword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                validators={[VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(6)]}
                errorText="Password must be at least 6 characters long"
                onInput={inputHandler}
                className={styles.passwordField}
              />
              <Button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className={styles.passwordToggle}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <>
                <FaSpinner className={styles.loadingIcon} size={18} />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </div>
    </>
  );
};

export default LoginForm;
