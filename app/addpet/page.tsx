"use client";

import React from "react";
import { useForm } from "@/lib/use-form";
import Input from "@/Components/CustomElements/input";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MIN,
  VALIDATOR_MAXLENGTH,
} from "@/lib/validators";
import ImageUpload from "@/Components/CustomElements/image-upload";
import styles from "./page.module.css";

const AddPetPage: React.FC = () => {
  const [formState, inputHandler] = useForm(
    {
      name: { value: "", isValid: false, touched: false },
      type: { value: "", isValid: false, touched: false },
      breed: { value: "", isValid: false, touched: false },
      lastVaccination: { value: "", isValid: false, touched: false },
      nextVaccination: { value: "", isValid: false, touched: false },
      description: { value: "", isValid: false, touched: false },
      image: { value: undefined, isValid: false, touched: false },
    },
    false
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.isValid) return;
    console.log("Submitting...");
    // build FormData and send to backend
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>Add a New Pet</h2>
      <div className={styles.formControls}>
        <div className={styles.fieldWrapper}>
          <Input
            id="name"
            element="input"
            type="text"
            label="Name"
            placeholder="Name of your pet"
            errorText="Name is required"
            onInput={inputHandler}
            validators={[VALIDATOR_REQUIRE()]}
          />
        </div>
        <div className={styles.fieldWrapper}>
          <Input
            id="type"
            element="radio"
            label="Please pick an option:"
            errorText="Please select one option"
            options={[
              { label: "Cat", value: "cat" },
              { label: "Dog", value: "dog" },
            ]}
            onInput={inputHandler}
            validators={[VALIDATOR_REQUIRE()]}
          />
        </div>
        <div className={styles.fieldWrapper}>
          <Input
            id="description"
            element="input"
            type="text"
            label="Description"
            placeholder="What describes your pet"
            errorText="Description is required & must be 5-50 characters"
            onInput={inputHandler}
            validators={[
              VALIDATOR_REQUIRE(),
              VALIDATOR_MIN(5),
              VALIDATOR_MAXLENGTH(50),
            ]}
          />
        </div>

        {/* Example of two columns for date fields on wider screens */}
        <div className={styles.twoCols}>
          <div className={styles.fieldWrapper}>
            <Input
              id="lastVaccination"
              element="input"
              type="date"
              label="Last Vaccination"
              errorText="Date is required"
              onInput={inputHandler}
              validators={[VALIDATOR_REQUIRE()]}
            />
          </div>
          <div className={styles.fieldWrapper}>
            <Input
              id="nextVaccination"
              element="input"
              type="date"
              label="Next Vaccination"
              errorText="Date is required"
              onInput={inputHandler}
              validators={[VALIDATOR_REQUIRE()]}
            />
          </div>
        </div>

        <div className={styles.fieldWrapper}>
          <Input
            id="breed"
            element="input"
            type="text"
            label="Breed"
            placeholder="Breed of your pet (or enter None)"
            errorText="Breed is required"
            onInput={inputHandler}
            validators={[VALIDATOR_REQUIRE()]}
          />
        </div>

        <div className={styles.imageWrapper}>
          <ImageUpload
            id="image"
            center
            errorText="Please provide an image."
            onInput={inputHandler}
          />
        </div>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={!formState.isValid}
      >
        Submit
      </button>
    </form>
  );
};

export default AddPetPage;
