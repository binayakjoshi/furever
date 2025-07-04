"use client";

import type React from "react";
import { useForm } from "@/lib/use-form";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrash } from "react-icons/fa";
import Input from "@/components/custom-elements/input";
import { type Pet } from "@/components/pets/pet-type";
import { VALIDATOR_REQUIRE, VALIDATOR_MAXLENGTH } from "@/lib/validators";
import ImageUpload from "@/components/custom-elements/image-upload";
import { useAuth } from "@/context/auth-context";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useHttp } from "@/lib/request-hook";
import styles from "./page.module.css";
import ErrorModal from "@/components/ui/error";

type AddPetResponse = {
  success: boolean;
  message: string;
  data: Pet;
};
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
      breed: { value: "", isValid: false, touched: false },
      petType: { value: "", isValid: false, touched: false },
      dob: { value: "", isValid: false, touched: false },
      description: { value: "", isValid: false, touched: false },
      image: { value: undefined, isValid: false, touched: false },
      diseases: { value: "", isValid: false, touched: false },
    },
    false
  );
  const { user } = useAuth();
  const router = useRouter();
  const { isLoading, sendRequest, error, clearError } =
    useHttp<AddPetResponse>();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.isValid) return;
    try {
      const requestData = new FormData();
      const diseasesString = formState.inputs.diseases.value as string;
      const diseasesArray = diseasesString.split(",").map((d) => d.trim());

      diseasesArray.forEach((d) => requestData.append("diseases", d));

      if (formState.vaccinations && formState.vaccinations.length) {
        const vaccArray = formState.vaccinations.map((v) => ({
          name: v.name,
          vaccDate: v.vaccDate,
          nextVaccDate: v.nextVaccDate,
        }));
        requestData.append("vaccinations", JSON.stringify(vaccArray));
      }
      requestData.append("name", formState.inputs.name.value as string);
      requestData.append(
        "description",
        formState.inputs.description.value as string
      );
      requestData.append("dob", formState.inputs.dob.value as string);
      requestData.append("breed", formState.inputs.breed.value as string);
      requestData.append("image", formState.inputs.image.value as File);
      requestData.append("petType", formState.inputs.petType.value as string);

      await sendRequest("/api/pets", "POST", requestData);
      router.push(`/user/${user?.userId}/pets`);
    } catch (_) {}
  };

  const handleVaccinationChange = (
    vaccinationId: string,
    field: keyof Omit<import("@/lib/use-form").VaccinationRecord, "id">,
    value: string
  ) => {
    updateVaccination(vaccinationId, field, value);
  };

  return (
    <>
      {error && <ErrorModal error={error} clearError={clearError} />}
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
                errorText="Name is required and must not exceed 50 Characters"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE(), VALIDATOR_MAXLENGTH(50)]}
              />
            </div>

            <div className={styles.fieldWrapper}>
              <Input
                id="petType"
                element="radio"
                label="Please pick an option:"
                errorText="Please select one option"
                options={[
                  { label: "Cat", value: "Cat" },
                  { label: "Dog", value: "Dog" },
                ]}
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE()]}
              />
            </div>

            <div className={styles.fieldWrapper}>
              <Input
                id="dob"
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
                errorText="Description is required"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE()]}
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
            <div className={styles.fieldWrapper}>
              <Input
                id="diseases"
                element="input"
                type="text"
                label="Diseases"
                placeholder="Enter diseases seperated by comma  (or enter None)"
                errorText="Diseases is required or Enter None"
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
                  <div
                    key={vaccination.id}
                    className={styles.vaccinationRecord}
                  >
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
                            value={vaccination.vaccDate}
                            onChange={(e) =>
                              handleVaccinationChange(
                                vaccination.id,
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
          {isLoading ? (
            <LoadingSpinner
              variant="orbit"
              size="small"
              text="Adding pet...."
            />
          ) : (
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
          )}
        </form>
      </div>
    </>
  );
};

export default AddPetPage;
