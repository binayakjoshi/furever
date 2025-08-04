"use client";
import { useRouter } from "next/navigation";
import { useForm } from "@/lib/use-form";
import Input from "@/components/custom-elements/input";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MAXLENGTH,
  VALIDATOR_NUMBER,
} from "@/lib/validators";
import { useHttp } from "@/lib/request-hook";
import ImageUpload from "@/components/custom-elements/image-upload";
import ErrorModal from "@/components/ui/error";
import Button from "@/components/custom-elements/button";
import SuccessPopup from "@/components/ui/success-popup";
import styles from "./page.module.css";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useState } from "react";

type AddAdoptionResponse = {
  success: boolean;
  message: string;
  data: {
    name: string;
    description: string;
    breed: string;
    petType: string;
    image: {
      url: string;
    };
    location: string;
    contactInfo: string;
    requiremnts: string;
  };
};

const PostAdoption = () => {
  const router = useRouter();
  const { isLoading, error, clearError, sendRequest } =
    useHttp<AddAdoptionResponse>();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [formState, inputHandler] = useForm(
    {
      name: {
        isValid: false,
        touched: false,
        value: "",
      },
      description: {
        isValid: false,
        touched: false,
        value: "",
      },
      breed: {
        isValid: false,
        touched: false,
        value: "",
      },
      image: {
        isValid: false,
        touched: false,
        value: undefined,
      },
      location: {
        isValid: false,
        touched: false,
        value: "",
      },
      contactInfo: {
        isValid: false,
        touched: false,
        value: "",
      },
      requirements: {
        isValid: false,
        touched: false,
        value: "",
      },
      petType: {
        isValid: false,
        touched: false,
        value: "",
      },
    },
    false
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.isValid) return;
    try {
      const requestData = new FormData();
      requestData.append("name", formState.inputs.name.value as string);
      requestData.append(
        "description",
        formState.inputs.description.value as string
      );
      requestData.append("breed", formState.inputs.breed.value as string);
      requestData.append("image", formState.inputs.image.value as File);
      requestData.append("petType", formState.inputs.petType.value as string);
      requestData.append("location", formState.inputs.location.value as string);
      requestData.append(
        "contactInfo",
        formState.inputs.contactInfo.value as string
      );
      requestData.append(
        "requirements",
        formState.inputs.requirements.value as string
      );
      console.log("request data");
      console.log(requestData);
      await sendRequest("/api/adoption/add", "POST", requestData);
      setShowSuccessPopup(true);
      setTimeout(() => {
        router.push("/adoption");
      }, 2000);
    } catch {}
  };
  return (
    <>
      {" "}
      {error && <ErrorModal error={error} clearError={clearError} />}
      <SuccessPopup
        message="Adoption post created successfully!"
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        duration={2000}
      />
      <div className={styles.container}>
        <form onSubmit={handleSubmit} noValidate>
          <h2 className={styles.title}>Post for Adoption</h2>
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
                id="description"
                element="input"
                type="text"
                label="Description"
                placeholder="short description of your pet"
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
                placeholder="Breed of pet enter None if unknown"
                errorText="Breed is required"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE()]}
              />
            </div>
            <div className={styles.fieldWrapper}>
              <Input
                id="location"
                element="input"
                type="text"
                label="Location"
                placeholder="Location of pet"
                errorText="Location is required"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE()]}
              />
            </div>
            <div className={styles.fieldWrapper}>
              <Input
                id="contactInfo"
                element="input"
                type="number"
                label="Contact Info"
                placeholder="Phone number"
                errorText="Phone number is required and must be a number"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE(), VALIDATOR_NUMBER()]}
              />
            </div>
            <div className={styles.fieldWrapper}>
              <Input
                id="requirements"
                element="input"
                type="text"
                label="Requirements"
                placeholder="requirements"
                errorText="Requirements is required"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE()]}
              />
            </div>
            <div className={styles.imageSection}>
              <ImageUpload
                id="image"
                center
                errorText="Please provide an image."
                onInput={inputHandler}
              />
            </div>
            {isLoading ? (
              <LoadingSpinner
                variant="orbit"
                size="small"
                text="Adding pet...."
              />
            ) : (
              <Button
                type="submit"
                className={`${styles.submitButton} ${
                  formState.isValid
                    ? styles.submitButtonEnabled
                    : styles.submitButtonDisabled
                }`}
                disabled={!formState.isValid}
              >
                Submit
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};
export default PostAdoption;
