"use client";

import React from "react";
import { useForm } from "@/lib/use-form";
import { useRouter } from "next/navigation";
//import { FaPlus, FaTrash } from "react-icons/fa";
import Input from "@/components/custom-elements/input";
import { ForumPost } from "@/lib/types";
import Button from "@/components/custom-elements/button";
import { VALIDATOR_REQUIRE, VALIDATOR_MAXLENGTH } from "@/lib/validators";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useHttp } from "@/lib/request-hook";
import styles from "./page.module.css";
import ErrorModal from "@/components/ui/error";
import SuccessPopup from "@/components/ui/success-popup";

type AddForumPosResponse = {
  success: boolean;
  message: string;
  data: ForumPost;
};
const AddForumPost = () => {
  const [formState, inputHandler] = useForm(
    {
      title: { value: "", isValid: false, touched: false },
      content: { value: "", isValid: false, touched: false },
      category: { value: "", isValid: false, touched: false },
    },
    false
  );
  const router = useRouter();
  const { isLoading, sendRequest, error, clearError } =
    useHttp<AddForumPosResponse>();
  const [showSuccessPopup, setShowSuccessPopup] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.isValid) return;

    try {
      await sendRequest(
        "/api/forum",
        "POST",
        JSON.stringify({
          title: formState.inputs.title.value,
          content: formState.inputs.content.value,
          category: formState.inputs.category.value,
        }),
        { "Content-Type": "application/json" }
      );
      setShowSuccessPopup(true);
      setTimeout(() => {
        router.push(`/pet-forum`);
      }, 2000);
    } catch {}
  };

  return (
    <>
      {error && <ErrorModal error={error} clearError={clearError} />}
      <SuccessPopup
        message="Post created successfully!"
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        duration={3000}
      />
      <div className={styles.container}>
        <form onSubmit={handleSubmit} noValidate>
          <h2 className={styles.title}>Create a Forum Post</h2>

          <div className={styles.formControls}>
            <div className={styles.fieldWrapper}>
              <Input
                id="title"
                element="input"
                type="text"
                label="Title"
                placeholder="Title of the post"
                errorText="Title is required and must not exceed 100 Characters"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE(), VALIDATOR_MAXLENGTH(50)]}
              />
            </div>
            <div className={styles.fieldWrapper}>
              <Input
                id="content"
                element="textarea"
                type="text"
                label="Description"
                placeholder=" Details of the post...."
                errorText="Description is required"
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE()]}
                rows={8}
              />
            </div>

            <div className={styles.fieldWrapper}>
              <Input
                id="category"
                element="radio"
                label="Please pick an option:"
                errorText="Please select one option"
                options={[
                  { label: "Emergency", value: "emergency" },
                  { label: "Training", value: "training" },
                  { label: "Veterinary", value: "veterinary" },
                  { label: "Nutrition", value: "nutrition" },
                  { label: "Adoption", value: "adoption" },
                  { label: "Pet Care", value: "pet-care" },
                  { label: "general", value: "general" },
                ]}
                onInput={inputHandler}
                validators={[VALIDATOR_REQUIRE()]}
              />
            </div>
          </div>
          {isLoading ? (
            <LoadingSpinner variant="orbit" size="small" text="Posting...." />
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
              Post
            </Button>
          )}
        </form>
      </div>
    </>
  );
};

export default AddForumPost;
