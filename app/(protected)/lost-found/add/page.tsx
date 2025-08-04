"use client";
import { useRouter } from "next/navigation";
import { useForm } from "@/lib/use-form";
import Input from "@/components/custom-elements/input";
import { VALIDATOR_REQUIRE, VALIDATOR_NUMBER } from "@/lib/validators";
import { useHttp } from "@/lib/request-hook";
import ImageUpload from "@/components/custom-elements/image-upload";
import ErrorModal from "@/components/ui/error";
import Button from "@/components/custom-elements/button";
import styles from "./page.module.css";
import LoadingSpinner from "@/components/ui/loading-spinner";

type AddLostPetResponse = {
  success: boolean;
  message: string;
  data: {
    breed: string;
    description: string;
    petType: string;
    image: {
      url: string;
    };
    location: string;
    contactInfo: string;
  };
};

const PostLostPet = () => {
  const router = useRouter();
  const { isLoading, error, clearError, sendRequest } =
    useHttp<AddLostPetResponse>();

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
    console.log("clicked first");
    if (!formState.isValid) return;
    console.log("clicked");
    try {
      const requestData = new FormData();
      requestData.append(
        "description",
        formState.inputs.description.value as string
      );
      requestData.append("name", formState.inputs.name.value as string);

      requestData.append("breed", formState.inputs.breed.value as string);

      requestData.append("image", formState.inputs.image.value as File);

      requestData.append("petType", formState.inputs.petType.value as string);
      requestData.append("location", formState.inputs.location.value as string);
      requestData.append(
        "contactInfo",
        formState.inputs.contactInfo.value as string
      );

      await sendRequest("/api/lost-found", "POST", requestData);
      console.log("clicked try again");
      router.push("/lost-found");
    } catch {}
  };
  return (
    <>
      {" "}
      {error && <ErrorModal error={error} clearError={clearError} />}
      <div className={styles.container}>
        <form onSubmit={handleSubmit} noValidate>
          <h2 className={styles.title}>Post for a Lost Pet</h2>
          <div className={styles.formControls}>
            <div className={styles.fieldWrapper}>
              <Input
                id="name"
                element="input"
                type="text"
                label="name"
                placeholder="name of your pet"
                errorText="name is required"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE()]}
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
export default PostLostPet;
