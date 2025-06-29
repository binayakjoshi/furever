"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FaEye, FaEyeSlash, FaSpinner, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa"
import Input from "@/components/custom-elements/input"
import Button from "../custom-elements/button"
import { useForm } from "@/lib/use-form"
import { useAuth } from "@/context/auth-context"
import { useHttp } from "@/lib/request-hook"
import { VALIDATOR_EMAIL, VALIDATOR_REQUIRE, VALIDATOR_MINLENGTH } from "@/lib/validators"
import styles from "./login-form.module.css"
import ErrorModal from "../ui/error"

type LoginResponse = {
  success: boolean
  message: string
  data?: { userId: string; name: string; role: string; email: string }
}

const LoginForm = () => {
  const { setUser } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { isLoading, error, sendRequest, clearError } = useHttp<LoginResponse>()

  const [formState, inputHandler] = useForm(
    {
      email: { value: "", isValid: false, touched: false },
      password: { value: "", isValid: false, touched: false },
    },
    false,
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formState.isValid || isLoading) return

    try {
      const response = await sendRequest(
        "/api/auth/login",
        "POST",
        JSON.stringify({
          email: formState.inputs.email.value,
          password: formState.inputs.password.value,
        }),
        { "Content-Type": "application/json" },
      )

      if (response.success && response.data) {
        setShowSuccess(true)
        setUser(response.data)

        // Delay navigation to show success message
        setTimeout(() => {
          router.push("/")
        }, 1000)
      }
    } catch (_) {
      // Error is handled by the useHttp hook
    }
  }

  const isFormValid = formState.isValid && formState.inputs.email.value && formState.inputs.password.value

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Welcome back</h1>
        <p className={styles.formSubtitle}>Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="email">
            Email address
          </label>
          <Input
            id="email"
            element="input"
            type="email"
            placeholder="you@example.com"
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address"
            onInput={inputHandler}
            className={styles.inputField}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <div className={styles.passwordContainer}>
            <Input
              id="password"
              element="input"
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

        {error && (
          <div className={styles.errorMessage}>
            <FaExclamationTriangle size={16} />
            {error}
          </div>
        )}

        {showSuccess && (
          <div className={styles.successMessage}>
            <FaCheckCircle size={16} />
            Login successful! Redirecting...
          </div>
        )}

        <Button type="submit" className={styles.submitButton} disabled={isLoading || !isFormValid}>
          {isLoading ? (
            <>
              <FaSpinner className={styles.loadingIcon} size={18} />
              Signing in...
            </>
          ) : showSuccess ? (
            <>
              <FaCheckCircle size={18} />
              Success!
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className={styles.formFooter}>
        <p>
          Don't have an account? <Link href="/signup">Create one here</Link>
        </p>
      </div>

      {error && <ErrorModal error={error} clearError={clearError} />}
    </div>
  )
}

export default LoginForm
