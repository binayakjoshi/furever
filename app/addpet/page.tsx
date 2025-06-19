"use client";

import type React from "react";
import { useForm } from "@/lib/use-form";
import Input from "@/Components/CustomElements/input";
import { VALIDATOR_REQUIRE, VALIDATOR_MAXLENGTH } from "@/lib/validators";
import ImageUpload from "@/Components/CustomElements/image-upload";
import { FaPlus, FaTrash } from "react-icons/fa";
import styles from "./page.module.css";

const AddPetPage: React.FC = () => {
  const [
    formState,
    inputHandler,
    ,
    ,
    addVaccination,
    removeVaccination,
    updateVaccination,
  ] = useForm(
    {
      name: { value: "", isValid: false, touched: false },
      type: { value: "", isValid: false, touched: false },
      breed: { value: "", isValid: false, touched: false },
      dateOfBirth: { value: "", isValid: false, touched: false },
      description: { value: "", isValid: false, touched: false },
      image: { value: undefined, isValid: false, touched: false },
    },
    false
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.isValid) return;

    const formData = {
      ...Object.fromEntries(
        Object.entries(formState.inputs).map(([key, input]) => [
          key,
          input.value,
        ])
      ),
      vaccinations: formState.vaccinations || [],
    };

    console.log("Submitting...", formData);
    // build FormData and send to backend
  };

  const handleVaccinationChange = (
    vaccinationId: string,
    field: keyof Omit<import("@/lib/use-form").VaccinationRecord, "id">,
    value: string
  ) => {
    updateVaccination(vaccinationId, field, value);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} noValidate>
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
              id="dateOfBirth"
              element="input"
              type="date"
              label="Date of Birth"
              errorText="Date is required"
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
              errorText="Description is required & must not be more than 50 characters"
              onInput={inputHandler}
              validators={[VALIDATOR_REQUIRE(), VALIDATOR_MAXLENGTH(50)]}
            />
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

          {/* Vaccination Section */}
          <div className={styles.vaccinationSection}>
            <div className={styles.vaccinationHeader}>
              <h3 className={styles.vaccinationTitle}>Vaccinations</h3>
              <button
                type="button"
                onClick={addVaccination}
                className={styles.addButton}
              >
                <FaPlus size={16} />
                Add Vaccination
              </button>
            </div>

            {(!formState.vaccinations ||
              formState.vaccinations.length === 0) && (
              <p className={styles.noVaccinationsText}>
                No vaccinations added yet. Click Add Vaccination to add one.
              </p>
            )}

            <div className={styles.vaccinationsList}>
              {(formState.vaccinations || []).map((vaccination) => (
                <div key={vaccination.id} className={styles.vaccinationRecord}>
                  <div className={styles.vaccinationContent}>
                    <div className={styles.vaccinationFields}>
                      <div className={styles.vaccinationField}>
                        <label className={styles.vaccinationLabel}>
                          Vaccination Name
                        </label>
                        <input
                          type="text"
                          value={vaccination.name}
                          onChange={(e) =>
                            handleVaccinationChange(
                              vaccination.id,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Rabies, DHPP"
                          className={styles.vaccinationInput}
                        />
                      </div>
                      <div className={styles.vaccinationField}>
                        <label className={styles.vaccinationLabel}>
                          Vaccination Date
                        </label>
                        <input
                          type="date"
                          value={vaccination.VaccDate}
                          onChange={(e) =>
                            handleVaccinationChange(
                              vaccination.id,
                              "VaccDate",
                              e.target.value
                            )
                          }
                          className={styles.vaccinationInput}
                        />
                      </div>
                      <div className={styles.vaccinationField}>
                        <label className={styles.vaccinationLabel}>
                          Next Vaccination Date
                        </label>
                        <input
                          type="date"
                          value={vaccination.nextVaccDate}
                          onChange={(e) =>
                            handleVaccinationChange(
                              vaccination.id,
                              "nextVaccDate",
                              e.target.value
                            )
                          }
                          className={styles.vaccinationInput}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVaccination(vaccination.id)}
                      className={styles.removeButton}
                      title="Remove vaccination"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.imageSection}>
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
          className={`${styles.submitButton} ${
            formState.isValid
              ? styles.submitButtonEnabled
              : styles.submitButtonDisabled
          }`}
          disabled={!formState.isValid}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddPetPage;
