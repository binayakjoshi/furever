"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "@/lib/use-form";
import { useHttp } from "@/lib/request-hook";
import Input from "@/components/custom-elements/input";
import Button from "@/components/custom-elements/button";
import { VALIDATOR_REQUIRE } from "@/lib/validators";
import ErrorModal from "@/components/ui/error";
import LoadingSpinner from "@/components/ui/loading-spinner";
import SuccessPopup from "@/components/ui/success-popup";
import Modal from "@/components/ui/modal";
import styles from "./page.module.css";
import type { AdoptionPet } from "@/lib/types";

interface AdoptionResponse {
  success: boolean;
  message: string;
  data: AdoptionPet;
}

const EditAdoptionForm = () => {
  const router = useRouter();
  const { adoptSlug } = useParams() as { adoptSlug: string };

  const [fetchedAdoptionPost, setFetchedAdoptionPost] =
    useState<AdoptionPet | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const [formState, inputHandler, setFormData] = useForm(
    {
      name: { value: "", isValid: false, touched: false },
      description: { value: "", isValid: false, touched: false },
      breed: { value: "", isValid: false, touched: false },
      petType: { value: "", isValid: false, touched: false },
      location: { value: "", isValid: false, touched: false },
      contactInfo: { value: "", isValid: false, touched: false },
      requirements: { value: "", isValid: false, touched: false },
    },
    false
  );

  const { isLoading, sendRequest, clearError, error } =
    useHttp<AdoptionResponse>();

  // Fetch adoption post
  useEffect(() => {
    (async () => {
      try {
        const res = await sendRequest(`/api/adoption/${adoptSlug}`);
        setFetchedAdoptionPost(res.data);
        setIsDataLoaded(true);
      } catch (err) {
        console.error("Failed to fetch adoption post:", err);
      }
    })();
  }, [sendRequest, adoptSlug]);

  // Set form data once fetched
  useEffect(() => {
    if (fetchedAdoptionPost) {
      setFormData(
        {
          name: {
            value: fetchedAdoptionPost.name,
            isValid: true,
            touched: true,
          },
          description: {
            value: fetchedAdoptionPost.description,
            isValid: true,
            touched: true,
          },
          breed: {
            value: fetchedAdoptionPost.breed,
            isValid: true,
            touched: true,
          },
          petType: {
            value: fetchedAdoptionPost.petType,
            isValid: true,
            touched: true,
          },
          location: {
            value: fetchedAdoptionPost.location,
            isValid: true,
            touched: true,
          },
          contactInfo: {
            value: fetchedAdoptionPost.contactInfo,
            isValid: true,
            touched: true,
          },
          requirements: {
            value: fetchedAdoptionPost.requirements,
            isValid: true,
            touched: true,
          },
        },
        true
      );
    }
  }, [fetchedAdoptionPost, setFormData]);

  // Regenerate form key when data is loaded
  useEffect(() => {
    setFormKey((prev) => prev + 1);
  }, [fetchedAdoptionPost, isDataLoaded]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.isValid) return;

    try {
      await sendRequest(
        `/api/adoption/my/${adoptSlug}`,
        "PUT",
        JSON.stringify({
          name: formState.inputs.name.value,
          description: formState.inputs.description.value,
          contactInfo: formState.inputs.contactInfo.value,
          location: formState.inputs.location.value,
          breed: formState.inputs.breed.value,
          petType: formState.inputs.petType.value,
          requirements: formState.inputs.requirements.value,
        }),
        { "Content-Type": "application/json" }
      );

      setShowSuccessPopup(true);
      setTimeout(() => {
        router.push("/adoption/my-post");
      }, 2000);
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  return (
    <Modal>
      {!isDataLoaded ? (
        <LoadingSpinner text="Fetching User Data..." />
      ) : (
        <div className={styles.formContainer}>
          {error && <ErrorModal error={error} clearError={clearError} />}
          <SuccessPopup
            message="Adoption post updated successfully!"
            isVisible={showSuccessPopup}
            onClose={() => setShowSuccessPopup(false)}
            duration={2000}
          />

          <div className={styles.header}>
            <h1 className={styles.title}>Edit your Adoption Post</h1>
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
                errorText="Name is required"
                onInput={inputHandler}
                className={styles.Input}
                initialValue={fetchedAdoptionPost?.name || ""}
                initialValid={true}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                id="description"
                element="input"
                type="text"
                label="Description of the pet"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Description is required"
                onInput={inputHandler}
                className={styles.Input}
                initialValue={fetchedAdoptionPost?.description || ""}
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
                initialValue={fetchedAdoptionPost?.petType || ""}
                initialValid={true}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                id="contactInfo"
                element="input"
                type="text"
                label="Contact Info"
                placeholder="Your phone number"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Contact info is required"
                onInput={inputHandler}
                initialValue={fetchedAdoptionPost?.contactInfo || ""}
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
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Breed is required"
                onInput={inputHandler}
                initialValue={fetchedAdoptionPost?.breed || ""}
                initialValid={true}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                id="location"
                element="input"
                type="text"
                label="Location"
                placeholder="Location"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Location is required"
                onInput={inputHandler}
                initialValue={fetchedAdoptionPost?.location || ""}
                initialValid={true}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                id="requirements"
                element="input"
                type="text"
                label="Requirements"
                placeholder="Requirements for adopting this pet"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Requirements are required"
                onInput={inputHandler}
                initialValue={fetchedAdoptionPost?.requirements || ""}
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
                  className={styles.saveButton}
                  disabled={!formState.isValid}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      )}
    </Modal>
  );
};

export default EditAdoptionForm;
