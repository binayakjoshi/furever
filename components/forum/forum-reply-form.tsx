import React, { useState } from "react";
import styles from "./forum-reply-form.module.css";

interface ReplyFormProps {
  onSubmit: (content: string) => Promise<void>;
  loading?: boolean;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ onSubmit, loading = false }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxLength = 1000;
  const charactersLeft = maxLength - content.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent("");
  };

  const getCharacterCountClass = () => {
    if (charactersLeft < 0) return styles.error;
    if (charactersLeft < 50) return styles.warning;
    return "";
  };

  return (
    <div className={styles.replyForm}>
      <h3 className={styles.replyFormTitle}>Add a Reply</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.replyFormGroup}>
          <textarea
            className={styles.replyTextarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, experiences, or ask a question..."
            disabled={isSubmitting || loading}
            maxLength={maxLength}
          />
          <div
            className={`${styles.characterCount} ${getCharacterCountClass()}`}
          >
            {charactersLeft} characters remaining
          </div>
        </div>
        <div className={styles.replyFormActions}>
          <button
            type="button"
            className={`${styles.replyButton} ${styles.secondary}`}
            onClick={handleCancel}
            disabled={isSubmitting || loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.replyButton} ${styles.primary}`}
            disabled={
              !content.trim() || isSubmitting || loading || charactersLeft < 0
            }
          >
            {isSubmitting ? "Posting..." : "Post Reply"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReplyForm;
