"use client";
import type React from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useForm } from "@/lib/use-form";
import Input from "../custom-elements/input";
import Button from "../custom-elements/button";
import { VALIDATOR_REQUIRE, VALIDATOR_MAXLENGTH } from "@/lib/validators";
import styles from "./edit-pet-form.module.css";

const EditPetForm = () => {
  const router = useRouter();
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
    },
    false
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.isValid) return;
    console.log("Submitting...");
    router.back();
  };
  const handleVaccinationChange = (
    vaccinationId: string,
    field: keyof Omit<import("@/lib/use-form").VaccinationRecord, "id">,
    value: string
  ) => {
    updateVaccination(vaccinationId, field, value);
  };
  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit your Pet data</h1>
        <Button
          className={styles.closeButton}
          onClick={() => router.back()}
          aria-label="Close modal"
        >
          ×
        </Button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.formGroup}>
          <Input
            id="name"
            element="input"
            type="tex"
            label="Name"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Name is Required"
            onInput={inputHandler}
            className={styles.Input}
          />
        </div>

        <div className={styles.formGroup}>
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

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <Input
              id="dateOfBirth"
              element="input"
              type="date"
              label="Date of Birth"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="DOB is Required"
              onInput={inputHandler}
              className={styles.Input}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
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
        <div className={styles.formGroup}>
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

          {(!formState.vaccinations || formState.vaccinations.length === 0) && (
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

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            className={styles.cancelButton}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!formState.isValid}
            className={styles.saveButton}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditPetForm;
