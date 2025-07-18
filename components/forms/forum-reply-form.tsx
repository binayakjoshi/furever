"use client";
import { FaSpinner } from "react-icons/fa";
import { useForm } from "@/lib/use-form";
import { useHttp } from "@/lib/request-hook";
import { VALIDATOR_REQUIRE } from "@/lib/validators";
import Input from "../custom-elements/input";
import Button from "../custom-elements/button";
import styles from "./forum-reply-form.module.css";
import ErrorModal from "../ui/error";
import { useRouter } from "next/navigation";

type ForumReplyFormProps = {
  postId: string;
  addReply: () => void;
};

const ForumReplyForm = ({ postId, addReply }: ForumReplyFormProps) => {
  const router = useRouter();
  const [formState, inputHandler, setFormData] = useForm(
    {
      content: { value: "", isValid: false, touched: false },
    },
    false
  );
  const { isLoading, sendRequest, error, clearError } = useHttp<unknown>();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const content = formState.inputs.content.value;
      const res = await sendRequest(
        `/api/forum/${postId}`,
        "POST",
        JSON.stringify({ content }),
        { "Content-Type": "application/json" }
      );
      addReply();
      setFormData(
        { content: { value: "", isValid: false, touched: false } },
        false
      );

      router.refresh();
    } catch {}
  };
  return (
    <>
      {error && <ErrorModal error={error} clearError={clearError} />}
      <form onSubmit={handleSubmit} noValidate>
        <Input
          id="content"
          element="input"
          type="text"
          placeholder="your reply"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter some text"
          onInput={inputHandler}
        />
        <Button
          type="submit"
          className={styles.submitButton}
          disabled={!formState.isValid || isLoading}
        >
          {isLoading ? (
            <div className={styles.loadingIcon}>
              <FaSpinner className={styles.loadingIcon} size={18} />
            </div>
          ) : (
            "Add Reply"
          )}
        </Button>
      </form>
    </>
  );
};
export default ForumReplyForm;
