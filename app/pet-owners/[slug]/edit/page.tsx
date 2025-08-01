"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useForm } from "@/lib/use-form";
import { useHttp } from "@/lib/request-hook";
import Input from "@/components/custom-elements/input";
import Button from "@/components/custom-elements/button";
import { VALIDATOR_REQUIRE } from "@/lib/validators";
import ErrorModal from "@/components/ui/error";
import LoadingSpinner from "@/components/ui/loading-spinner";
import SuccessPopup from "@/components/ui/success-popup";
import styles from "./page.module.css";
import Modal from "@/components/ui/modal";
import { PetOwner } from "@/lib/types";

type UserDetailResponse = {
  success: boolean;
  message: string;
  data: PetOwner;
};
const EditUserForm = () => {
  const router = useRouter();
  const { user } = useAuth();

  const formatDateForInput = (iso: string | undefined) =>
    iso ? iso.split("T")[0] : "";

  const [formState, inputHandler, setFormData] = useForm(
    {
      name: { value: "", isValid: false, touched: false },
      phone: { value: "", isValid: false, touched: false },
      address: { value: "", isValid: false, touched: false },
      dob: { value: "", isValid: false, touched: false },
    },
    false
  );

  const { isLoading, sendRequest, clearError, error } =
    useHttp<UserDetailResponse>();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    if (!user) return;
    const dobValue = formatDateForInput((user as PetOwner).dob);
    setFormData(
      {
        name: { value: user?.name, isValid: true, touched: true },
        phone: {
          value: (user as PetOwner)?.phone,
          isValid: true,
          touched: true,
        },
        address: {
          value: (user as PetOwner)?.address,
          isValid: true,
          touched: true,
        },
        dob: { value: dobValue, isValid: true, touched: true },
      },
      true
    );
  }, [setFormData, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.isValid) return;

    try {
      // const requestData = new FormData();

      // requestData.append("name", formState.inputs.name.value as string);
      // requestData.append("dob", formState.inputs.dob.value as string);
      // requestData.append("phone", formState.inputs.phone.value as string);
      // requestData.append("address", formState.inputs.address.value as string);

      // console.log("Submitting form data:");
      // console.log(requestData);
      // await sendRequest(`/api/user/`, "PUT", requestData);
      await sendRequest(
        "/api/pet-owners/",
        "PUT",
        JSON.stringify({
          name: formState.inputs.name.value,
          dob: formState.inputs.dob.value,
          phone: formState.inputs.phone.value,
          address: formState.inputs.address.value,
        }),
        { "Content-Type": "application/json" }
      );
      setShowSuccessPopup(true);
      setTimeout(() => {
        router.push(`/pet-owners/${user?.userId}`);
      }, 2000);
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };
  return (
    <Modal>
      {!user ? (
        <LoadingSpinner text="Fetching User Data...." />
      ) : (
        <div className={styles.formContainer}>
          {error && <ErrorModal error={error} clearError={clearError} />}
          <SuccessPopup
            message="Changes saved successfully!"
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
                  id="dob"
                  element="input"
                  type="date"
                  label="Date of Birth"
                  validators={[VALIDATOR_REQUIRE()]}
                  errorText="DOB is Required"
                  onInput={inputHandler}
                  className={styles.Input}
                  initialValue={
                    formatDateForInput((user as PetOwner)?.dob) || ""
                  }
                  initialValid={true}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <Input
                id="phone"
                element="input"
                type="text"
                label="Phone Number"
                placeholder="Your Phone number"
                errorText="Phone number is required"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE()]}
                initialValue={(user as PetOwner)?.phone || ""}
                initialValid={true}
              />
            </div>

            <div className={styles.formGroup}>
              <Input
                id="address"
                element="input"
                type="text"
                label="Address"
                placeholder="Your Address"
                errorText="Address is Required"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE()]}
                initialValue={(user as PetOwner)?.address || ""}
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
      )}
    </Modal>
  );
};

export default EditUserForm;
