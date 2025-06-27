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

type LoginResponse = {
  success: boolean;
  message: string;
  data?: { userId: string; name: string; role: string; email: string };
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
    } catch (_) {
      // error is already set by the hook
    }
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
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className={styles.passwordToggle}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </Button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error.title && <strong>{error.title}</strong>} {error.message}
          <button onClick={clearError} className={styles.errorClose}>
            ✕
          </button>
        </div>
      )}

      <Button
        type="submit"
        className={styles.submitButton}
        disabled={
          isLoading ||
          !formState.isValid ||
          !formState.inputs.email.value ||
          !formState.inputs.password.value
        }
      >
        {isLoading ? (
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
