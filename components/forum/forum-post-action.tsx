"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import ForumReplyForm from "../forms/forum-reply-form";
import Button from "../custom-elements/button";
import styles from "./forum-post-action.module.css";

type ForumPostActionProps = {
  authorId: string;
  postId: string;
  validatePath: () => void;
};
const ForumPostAction = ({
  authorId,
  postId,
  validatePath,
}: ForumPostActionProps) => {
  const { user } = useAuth();
  const router = useRouter();
  if (user?.userId === authorId)
    return (
      <div className={styles.buttonGroup}>
        <Button
          className={styles.editButton}
          onClick={() => router.push(`/pet-forum/post/${postId}/edit`)}
        >
          Edit
        </Button>
        <Button
          className={styles.removeButton}
          onClick={() => router.push(`/pet-forum/post/${postId}/delete`)}
        >
          Remove
        </Button>
      </div>
    );

  return (
    <div className={styles.replyFormSection}>
      <h4>Add a Reply</h4>
      <ForumReplyForm postId={postId} addReply={validatePath} />
    </div>
  );
};
export default ForumPostAction;
