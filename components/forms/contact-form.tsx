"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { useForm } from "@/lib/use-form";
import Input from "../custom-elements/input";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MAXLENGTH,
  VALIDATOR_REQUIRE,
} from "@/lib/validators";
import styles from "./contact-form.module.css";
import SuccessPopup from "../ui/success-popup";
import Button from "../custom-elements/button";
import ErrorModal from "../ui/error";
import { useHttp } from "@/lib/request-hook";

type contactFormResponse = {
  success: boolean;
};
const ContactForm = () => {
  const [formState, inputHandler] = useForm(
    {
      name: { value: "", isValid: false, touched: false },
      email: { value: "", isValid: false, touched: false },
      subject: { value: "", isValid: false, touched: false },
      message: { value: "", isValid: false, touched: false },
    },
    false
  );
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const router = useRouter();

  const { isLoading, error, clearError, sendRequest } =
    useHttp<contactFormResponse>();
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const url = "/api/contact";
      const res = await sendRequest(
        url,
        "POST",
        JSON.stringify({
          name: formState.inputs.name.value,
          email: formState.inputs.email.value,
          subject: formState.inputs.subject.value,
          message: formState.inputs.message.value,
        }),
        { "Content-Type": "application/json" }
      );
      if (res.success) {
        setShowSuccessPopup(true);
      }

      setTimeout(() => {
        router.push("/adoption");
      }, 2000);
    } catch {}
  };
  return (
    <>
      {error && <ErrorModal error={error} clearError={clearError} />}
      <SuccessPopup
        message="Contact message was successfully sent!!!"
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        duration={2000}
      />
      <div className={styles.form}>
        <h2 className={styles.formTitle}>Send us a Message</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formField}>
            <Input
              id="name"
              element="input"
              type="text"
              label="Name"
              placeholder="Your Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Name is Required"
              onInput={inputHandler}
              className={styles.input}
            />
          </div>
          <div className={styles.formField}>
            <Input
              id="email"
              element="input"
              type="email"
              label="Email"
              placeholder="your.email@example.com"
              validators={[VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()]}
              errorText="Please enter a valid email"
              onInput={inputHandler}
              className={styles.input}
            />
          </div>
          <div className={styles.formField}>
            <Input
              id="subject"
              element="input"
              type="text"
              label="Subject"
              placeholder="Subject of your message"
              validators={[VALIDATOR_REQUIRE(), VALIDATOR_MAXLENGTH(50)]}
              errorText="Subject is required & must be under 50 characters"
              onInput={inputHandler}
              className={styles.input}
            />
          </div>
          <div className={styles.formField}>
            <Input
              id="message"
              element="textarea"
              type="text"
              label="Message"
              placeholder="Please describe your inquiry in detail"
              validators={[VALIDATOR_REQUIRE(), VALIDATOR_MAXLENGTH(500)]}
              errorText="Message is required & must be under 500 characters"
              onInput={inputHandler}
              className={styles.input}
            />
          </div>
          {isLoading ? (
            <FaSpinner />
          ) : (
            <Button
              type="submit"
              className={styles.submitButton}
              disabled={!formState.isValid}
            >
              Submit
            </Button>
          )}
        </form>
      </div>
    </>
  );
};

export default ContactForm;
