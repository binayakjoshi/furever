"use client";
import { FormEvent } from "react";
import { useForm } from "@/lib/use-form";
import Input from "../custom-elements/input";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MAXLENGTH,
  VALIDATOR_REQUIRE,
} from "@/lib/validators";
import styles from "./contact-form.module.css";
import Button from "../custom-elements/button";

type contactFomrProps = {
  handleSubmit: (event: FormEvent) => void;
};
const ContactForm = ({ handleSubmit }: contactFomrProps) => {
  const [formState, inputHandler] = useForm(
    {
      name: { value: "", isValid: false, touched: false },
      email: { value: "", isValid: false, touched: false },
      subject: { value: "", isValid: false, touched: false },
      message: { value: "", isValid: false, touched: false },
    },
    false
  );

  return (
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
            className={styles.Input}
          />
        </div>
        <div className={styles.formField}>
          <Input
            id="email"
            element="input"
            type="email"
            label="Email"
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email"
            onInput={inputHandler}
            className={styles.Input}
          />
        </div>
        <div className={styles.formField}>
          <Input
            id="subject"
            element="input"
            type="text"
            label="Subject"
            placeholder="your email"
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_MAXLENGTH(25)]}
            errorText="Subject is required & must be under 50 Char"
            onInput={inputHandler}
            className={styles.Input}
          />
        </div>
        <div className={styles.formField}>
          <Input
            id="message"
            element="input"
            type="text"
            label="Message"
            placeholder="Please describe your inquiry in detail"
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_MAXLENGTH(150)]}
            errorText="message is required & must be under 150 Char"
            onInput={inputHandler}
            className={styles.Input}
          />
        </div>

        <Button type="submit" className={styles.submitButton}>
          Submit
        </Button>
      </form>
    </div>
  );
};
export default ContactForm;
