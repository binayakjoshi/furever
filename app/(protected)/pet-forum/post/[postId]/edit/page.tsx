"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "@/lib/use-form";
import { useHttp } from "@/lib/request-hook";
import { VALIDATOR_REQUIRE, VALIDATOR_MAXLENGTH } from "@/lib/validators";

import Input from "@/components/custom-elements/input";
import Button from "@/components/custom-elements/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ErrorModal from "@/components/ui/error";
import SuccessPopup from "@/components/ui/success-popup";
import Modal from "@/components/ui/modal";

import styles from "./page.module.css";
import type { ForumPost } from "@/lib/types";

interface ForumPostResponse {
  success: boolean;
  message: string;
  data: ForumPost;
}

const EditForumPost = () => {
  const { postId } = useParams() as { postId: string };
  const router = useRouter();

  const [fetchedPost, setFetchedPost] = useState<ForumPost | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: { value: "", isValid: false, touched: false },
      content: { value: "", isValid: false, touched: false },
      category: { value: "", isValid: false, touched: false },
    },
    false
  );

  const { isLoading, sendRequest, error, clearError } =
    useHttp<ForumPostResponse>();

  // Fetch forum post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await sendRequest(`/api/forum/${postId}`);
        setFetchedPost(res.data);
      } catch (err) {
        console.error("Failed to fetch post:", err);
      }
    };
    fetchPost();
  }, [sendRequest, postId]);

  // Populate form when post is loaded
  useEffect(() => {
    if (fetchedPost) {
      setFormData(
        {
          title: {
            value: fetchedPost.title,
            isValid: true,
            touched: true,
          },
          content: {
            value: fetchedPost.content,
            isValid: true,
            touched: true,
          },
          category: {
            value: fetchedPost.category,
            isValid: true,
            touched: true,
          },
        },
        true
      );
    }
  }, [fetchedPost, setFormData]);

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.isValid) return;

    try {
      await sendRequest(
        `/api/forum/${postId}`,
        "PUT",
        JSON.stringify({
          title: formState.inputs.title.value,
          content: formState.inputs.content.value,
          category: formState.inputs.category.value,
        }),
        { "Content-Type": "application/json" }
      );

      setShowSuccessPopup(true);
      setTimeout(() => {
        router.push(`/pet-forum/post/${postId}`);
      }, 2000);
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  return (
    <>
      {error && <ErrorModal error={error} clearError={clearError} />}
      <SuccessPopup
        message="Post updated successfully!"
        isVisible={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        duration={3000}
      />
      <Modal>
        {isLoading && !fetchedPost ? (
          <LoadingSpinner text="Fetching Post data..." />
        ) : (
          <div className={styles.formContainer}>
            <div className={styles.header}>
              <h2 className={styles.title}>Edit Your Forum Post</h2>
              <Button
                className={styles.closeButton}
                onClick={() => router.back()}
                aria-label="Close modal"
              >
                ×
              </Button>
            </div>
            <form onSubmit={handleSubmit} noValidate className={styles.form}>
              <div className={styles.formGroup}>
                <Input
                  id="title"
                  element="input"
                  type="text"
                  label="Title"
                  placeholder="Title of the post"
                  className={styles.Input}
                  errorText="Title is required and must not exceed 50 characters"
                  onInput={inputHandler}
                  validators={[VALIDATOR_REQUIRE(), VALIDATOR_MAXLENGTH(50)]}
                  initialValue={fetchedPost?.title || ""}
                  initialValid={true}
                />
              </div>

              <div className={styles.fieldWrapper}>
                <Input
                  id="content"
                  element="textarea"
                  label="Description"
                  placeholder="Details of the post..."
                  errorText="Description is required"
                  onInput={inputHandler}
                  validators={[VALIDATOR_REQUIRE()]}
                  initialValue={fetchedPost?.content || ""}
                  initialValid={true}
                  rows={8}
                  className={styles.Input}
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  id="category"
                  element="radio"
                  label="Please pick a category:"
                  errorText="Please select one option"
                  initialValid={true}
                  options={[
                    { label: "Emergency", value: "emergency" },
                    { label: "Training", value: "training" },
                    { label: "Veterinary", value: "veterinary" },
                    { label: "Nutrition", value: "nutrition" },
                    { label: "Adoption", value: "adoption" },
                    { label: "Pet Care", value: "pet-care" },
                    { label: "General", value: "general" },
                  ]}
                  onInput={inputHandler}
                  validators={[VALIDATOR_REQUIRE()]}
                  initialValue={fetchedPost?.category || ""}
                />
              </div>

              {isLoading ? (
                <LoadingSpinner
                  variant="orbit"
                  size="small"
                  text="Posting..."
                />
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
    </>
  );
};

export default EditForumPost;
