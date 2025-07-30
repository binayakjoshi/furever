"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useForm } from "@/lib/use-form";
import { useHttp } from "@/lib/request-hook";
import Input from "../custom-elements/input";
import Button from "../custom-elements/button";
import { VALIDATOR_REQUIRE } from "@/lib/validators";
import ErrorModal from "../ui/error";
import LoadingSpinner from "../ui/loading-spinner";
import SuccessPopup from "../ui/success-popup";
import type { Pet } from "@/lib/types";
import styles from "./edit-pet-form.module.css";

const useUniqueKey = (deps: unknown[]) => {
  const [key, setKey] = useState(0);
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, deps);
  return key;
};

type PetDetailResponse = {
  success: boolean;
  message: string;
  data: Pet;
};

const EditPetForm = () => {
  const router = useRouter();
  const { petSlug } = useParams();
  const [fetchedPet, setFetchedPet] = useState<Pet | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const formKey = useUniqueKey([fetchedPet, isDataLoaded]);

  const [
    formState,
    inputHandler,
    setFormData,
    ,
    addVaccination,
    removeVaccination,
    updateVaccination,
    setVaccinations,
  ] = useForm(
    {
      name: { value: "", isValid: false, touched: false },
      petType: { value: "", isValid: false, touched: false },
      breed: { value: "", isValid: false, touched: false },
      dob: { value: "", isValid: false, touched: false },
      description: { value: "", isValid: false, touched: false },
      diseases: { value: "", isValid: false, touched: false },
    },
    false
  );

  const { isLoading, sendRequest, clearError, error } =
    useHttp<PetDetailResponse>();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await sendRequest(`/api/pets/${petSlug}`);
        res.data.dob = res.data.dob.split("T")[0];
        setFetchedPet(res.data);
        setIsDataLoaded(true);
      } catch {}
    })();
  }, [sendRequest, petSlug]);

  useEffect(() => {
    if (!fetchedPet || !isDataLoaded) return;

    const timer = setTimeout(() => {
      setFormData(
        {
          name: { value: fetchedPet.name, isValid: true, touched: true },
          petType: { value: fetchedPet.petType, isValid: true, touched: true },
          breed: { value: fetchedPet.breed, isValid: true, touched: true },
          dob: { value: fetchedPet.dob, isValid: true, touched: true },
          description: {
            value: fetchedPet.description,
            isValid: true,
            touched: true,
          },
          diseases: {
            value: Array.isArray(fetchedPet.diseases)
              ? fetchedPet.diseases.join(",")
              : fetchedPet.diseases || "",
            isValid: true,
            touched: true,
          },
        },
        false
      );

      if (fetchedPet.vaccinations && fetchedPet.vaccinations.length > 0) {
        const formattedVaccinations = fetchedPet.vaccinations.map(
          (vacc, index) => ({
            id: vacc.id?.toString() || `${Date.now()}-${index}`,
            name: vacc.name || "",
            vaccDate: vacc.vaccDate ? vacc.vaccDate.split("T")[0] : "",
            nextVaccDate: vacc.nextVaccDate
              ? vacc.nextVaccDate.split("T")[0]
              : "",
          })
        );

        setVaccinations(formattedVaccinations);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [fetchedPet, setFormData, setVaccinations, isDataLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.isValid) return;

    try {
      const requestData = new FormData();

      const diseasesString = formState.inputs.diseases.value as string;
      const diseasesArray = diseasesString.split(",").map((d) => d.trim());
      diseasesArray.forEach((d) => requestData.append("diseases", d));

      if (formState.vaccinations && formState.vaccinations.length > 0) {
        formState.vaccinations.forEach((v, i) => {
          requestData.append(`vaccinations[${i}][name]`, v.name);
          requestData.append(`vaccinations[${i}][vaccDate]`, v.vaccDate);
          requestData.append(
            `vaccinations[${i}][nextVaccDate]`,
            v.nextVaccDate
          );
        });
      }

      // Other form fields
      requestData.append("name", formState.inputs.name.value as string);
      requestData.append(
        "description",
        formState.inputs.description.value as string
      );
      requestData.append("dob", formState.inputs.dob.value as string);
      requestData.append("breed", formState.inputs.breed.value as string);
      requestData.append("petType", formState.inputs.petType.value as string);

      console.log("Submitting form data:");
      for (const [key, value] of requestData.entries()) {
        console.log(`${key}: ${value}`);
      }

      await sendRequest(`/api/pets/${petSlug}/edit`, "PUT", requestData);
      setShowSuccessPopup(true);
      setTimeout(() => {
        router.push(`/pets/${petSlug}`);
      }, 2000);
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  const handleVaccinationChange = (
    id: string,
    field: keyof Omit<import("@/lib/use-form").VaccinationRecord, "id">,
    value: string
  ) => updateVaccination(id, field, value);

  if (!fetchedPet || !isDataLoaded)
    return <LoadingSpinner text="Loading Pet Info..." />;

  return (
    <div className={styles.formContainer}>
      {error && <ErrorModal error={error} clearError={clearError} />}
      <SuccessPopup
        message="✅ Changes saved successfully!"
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        duration={3000}
      />
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

      <form
        key={formKey}
        onSubmit={handleSubmit}
        className={styles.form}
        noValidate
      >
        <div className={styles.formGroup}>
          <Input
            id="name"
            element="input"
            type="text"
            label="Name"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Name is Required"
            onInput={inputHandler}
            className={styles.Input}
            initialValue={fetchedPet?.name || ""}
            initialValid={true}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            id="petType"
            element="radio"
            label="Please pick an option:"
            options={[
              { label: "Cat", value: "Cat" },
              { label: "Dog", value: "Dog" },
            ]}
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please select one option"
            onInput={inputHandler}
            initialValue={fetchedPet?.petType || ""}
            initialValid={true}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <Input
              id="dob"
              element="input"
              type="date"
              label="Date of Birth"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="DOB is Required"
              onInput={inputHandler}
              className={styles.Input}
              initialValue={fetchedPet?.dob || ""}
              initialValid={true}
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
            errorText="Description is required"
            onInput={inputHandler}
            validators={[VALIDATOR_REQUIRE()]}
            initialValue={fetchedPet?.description || ""}
            initialValid={true}
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
            initialValue={fetchedPet?.breed || ""}
            initialValid={true}
          />
        </div>
        <div className={styles.formGroup}>
          <Input
            id="diseases"
            element="input"
            type="text"
            label="Diseases"
            placeholder="Enter diseases seperated by comma  (or enter None)"
            errorText="Diseases is required or Enter None"
            onInput={inputHandler}
            validators={[VALIDATOR_REQUIRE()]}
            initialValue={
              Array.isArray(fetchedPet?.diseases)
                ? fetchedPet.diseases.join(",")
                : fetchedPet?.diseases || ""
            }
            initialValid={true}
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
              <FaPlus size={16} /> Add Vaccination
            </button>
          </div>

          {(!formState.vaccinations || formState.vaccinations.length === 0) && (
            <p className={styles.noVaccinationsText}>
              No vaccinations added yet. Click Add Vaccination to add one.
            </p>
          )}

          <div className={styles.vaccinationsList}>
            {formState.vaccinations?.map((vac) => (
              <div key={vac.id} className={styles.vaccinationRecord}>
                <div className={styles.vaccinationContent}>
                  <div className={styles.vaccinationFields}>
                    <div className={styles.vaccinationField}>
                      <label className={styles.vaccinationLabel}>
                        Vaccination Name
                      </label>
                      <input
                        type="text"
                        value={vac.name}
                        onChange={(e) =>
                          handleVaccinationChange(
                            vac.id,
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
                        value={vac.vaccDate}
                        onChange={(e) =>
                          handleVaccinationChange(
                            vac.id,
                            "vaccDate",
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
                        value={vac.nextVaccDate}
                        onChange={(e) =>
                          handleVaccinationChange(
                            vac.id,
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
                    onClick={() => removeVaccination(vac.id)}
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
        {isLoading ? (
          <LoadingSpinner text="Updating..." />
        ) : (
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
        )}
      </form>
    </div>
  );
};

export default EditPetForm;
