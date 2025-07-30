"use client";

import type React from "react";
import { useForm } from "@/lib/use-form";
import { useRouter, useParams } from "next/navigation";
import Input from "@/components/custom-elements/input";
import { ForumPost } from "@/lib/types";
import Button from "@/components/custom-elements/button";
import { VALIDATOR_REQUIRE, VALIDATOR_MAXLENGTH } from "@/lib/validators";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useHttp } from "@/lib/request-hook";
import styles from "./page.module.css";
import ErrorModal from "@/components/ui/error";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/modal";

const useUniqueKey = (deps: unknown[]) => {
  const [key, setKey] = useState(0);
  useEffect(() => {
    setKey((prev) => prev + 1);
  }, deps);
  return key;
};
type ForumPosResponse = {
  success: boolean;
  message: string;
  data: ForumPost;
};
const EditForumPost = () => {
  const [formState, inputHandler, setFormData] = useForm(
    {
      title: { value: "", isValid: false, touched: false },
      content: { value: "", isValid: false, touched: false },
      category: { value: "", isValid: false, touched: false },
    },
    false
  );

  const { postId } = useParams();
  const [fetchedForumPost, setFetchedForumPost] = useState<ForumPost | null>(
    null
  );
  const formKey = useUniqueKey([fetchedForumPost]);

  const router = useRouter();
  const { isLoading, sendRequest, error, clearError } =
    useHttp<ForumPosResponse>();

  useEffect(() => {
    try {
      const fetchForumPost = async () => {
        const res = await sendRequest(`/api/forum/${postId}`);
        setFetchedForumPost(res.data);
      };
      fetchForumPost();
    } catch {}
  }, [sendRequest, postId]);

  useEffect(() => {
    if (fetchedForumPost && !isLoading) {
      setFormData(
        {
          title: {
            value: fetchedForumPost?.title,
            isValid: true,
            touched: true,
          },
          content: {
            value: fetchedForumPost?.content,
            isValid: true,
            touched: true,
          },
          category: {
            value: fetchedForumPost?.category,
            isValid: true,
            touched: true,
          },
        },
        true
      );
    }
  }, [setFormData, fetchedForumPost, isLoading]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      router.push(`/pet-forum/post/${postId}`);
    } catch {}
  };

  return (
    <>
      {error && <ErrorModal error={error} clearError={clearError} />}
      <Modal>
        {isLoading ? (
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
            <form
              key={formKey}
              onSubmit={handleSubmit}
              noValidate
              className={styles.form}
            >
              <div className={styles.formGroup}>
                <Input
                  id="title"
                  element="input"
                  type="text"
                  label="Title"
                  placeholder="Title of the post"
                  className={styles.Input}
                  errorText="Title is required and must not exceed 100 Characters"
                  onInput={inputHandler}
                  initialValue={fetchedForumPost?.title}
                  initialValid={true}
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
                  initialValue={fetchedForumPost?.content}
                  initialValid={true}
                  rows={8}
                  className={styles.Input}
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  id="category"
                  element="radio"
                  label="Please pick an option:"
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
                  initialValue={fetchedForumPost?.category}
                />
              </div>

              {isLoading ? (
                <LoadingSpinner
                  variant="orbit"
                  size="small"
                  text="Posting...."
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
    </>
  );
};

export default EditForumPost;
