"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useForm } from "@/lib/use-form";
import { useHttp } from "@/lib/request-hook";
import Input from "@/components/custom-elements/input";
import Button from "@/components/custom-elements/button";
import { VALIDATOR_REQUIRE } from "@/lib/validators";
import ErrorModal from "@/components/ui/error";
import LoadingSpinner from "@/components/ui/loading-spinner";
import styles from "./page.module.css";
import Modal from "@/components/ui/modal";
import { Vet } from "@/lib/types";

type VetDetailResponse = {
  success: boolean;
  message: string;
  data: Vet;
};
const EditVetForm = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [formState, inputHandler, setFormData] = useForm(
    {
      name: { value: "", isValid: false, touched: false },
      degree: { value: "", isValid: false, touched: false },
      licenseNumber: { value: "", isValid: false, touched: false },
      experience: { value: "", isValid: false, touched: false },
      availability: { value: "", isValid: false, touched: false },
    },
    false
  );

  const { isLoading, sendRequest, clearError, error } =
    useHttp<VetDetailResponse>();

  useEffect(() => {
    if (!user) return;
    if ("licenseNumber" in user) {
      setFormData(
        {
          name: { value: user?.name, isValid: true, touched: true },
          degree: { value: user?.degree, isValid: true, touched: true },
          licenseNumber: {
            value: user?.licenseNumber,
            isValid: true,
            touched: true,
          },
          experience: { value: user.experience, isValid: true, touched: true },
          availability: {
            value: user.availability,
            isValid: true,
            touched: true,
          },
        },
        true
      );
    }
  }, [setFormData, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.isValid) return;

    try {
      await sendRequest(
        "/api/user/",
        "PUT",
        JSON.stringify({
          name: formState.inputs.name.value,
          experience: formState.inputs.experience.value,
          degree: formState.inputs.degree.value,
          licenseNumber: formState.inputs.licenseNumber.value,
          availability: formState.inputs.availability.value,
        }),
        { "Content-Type": "application/json" }
      );
      router.push(`/vets/${user?.userId}`);
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };
  return (
    <Modal>
      {user && "licenseNumber" in user ? (
        <div className={styles.formContainer}>
          {error && <ErrorModal error={error} clearError={clearError} />}

          <div className={styles.header}>
            <h1 className={styles.title}>Edit your User data</h1>
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
                type="text"
                label="Name"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Name is Required"
                onInput={inputHandler}
                className={styles.Input}
                initialValue={user?.name || ""}
                initialValid={true}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  id="degree"
                  element="input"
                  type="input"
                  label="Degree"
                  placeholder="Your Qualification"
                  validators={[VALIDATOR_REQUIRE()]}
                  errorText="Degree is Required"
                  onInput={inputHandler}
                  className={styles.Input}
                  initialValue={user?.degree || ""}
                  initialValid={true}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <Input
                id="experience"
                element="input"
                type="text"
                label="Experience"
                placeholder="Your Experience in years"
                errorText="Experience is required"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE()]}
                initialValue={user?.experience || ""}
                initialValid={true}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                id="licenseNumber"
                element="input"
                type="text"
                label="License Nummber"
                placeholder="Your License Number"
                errorText="License Number"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE()]}
                initialValue={user?.licenseNumber || ""}
                initialValid={true}
              />
            </div>
            <div className={styles.formGroup}>
              <Input
                id="availability"
                element="input"
                type="text"
                label="Availability"
                placeholder="availability... Eg: Mon - Fri , 10Am - 4Pm"
                errorText="Availabilty is required"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE()]}
                initialValue={user?.availability || ""}
                initialValid={true}
              />
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
      ) : (
        <LoadingSpinner text="Fetching User Data...." />
      )}
    </Modal>
  );
};

export default EditVetForm;
