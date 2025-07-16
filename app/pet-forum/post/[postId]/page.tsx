import Link from "next/link";
import { cookies } from "next/headers";
import Image from "next/image";
import { ForumPost } from "@/lib/types";
import ReplyItem from "@/components/forum/forum-reply-item";
import styles from "./page.module.css";
import ForumReplyForm from "@/components/forms/forum-reply-form";
import { revalidatePath } from "next/cache";

type ForumPostDetailProps = {
  params: Promise<{ postId: string }>;
};

const ForumPostDetailPage = async ({ params }: ForumPostDetailProps) => {
  const { postId } = await params;
  const cookieHeader = (await cookies()).toString();
  let forumPost: ForumPost;

  try {
    const res = await fetch(
      `${process.env.NEXT_ROUTE_URL}/api/forum/${postId}`,
      {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error("Post not found");
    const resJson = await res.json();
    forumPost = resJson.data;
  } catch (err) {
    console.error(err);
    throw new Error("Coouldn't get the Post Detail");
  }
  const validatePath = async () => {
    "use server";
    revalidatePath(`/pet-forum/post/${postId}`);
  };
  return (
    <>
      <div className={styles.container}>
        {/* Navigation */}
        <div className={styles.navigation}>
          <Link href="/pet-forum" className={styles.backLink}>
            ← Back to Forum
          </Link>
          <div className={styles.category}>
            <span className={styles.categoryTag}>{forumPost.category}</span>
          </div>
        </div>

        {/* Post Header */}
        <div className={styles.postHeader}>
          <h1 className={styles.title}>{forumPost.title}</h1>
          <div className={styles.postMeta}>
            <div className={styles.author}>
              <Image
                src={forumPost.author.profileImage.url}
                alt={forumPost.author.name}
                width={40}
                height={40}
                className={styles.authorImage}
              />
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>
                  {forumPost.author.name}
                </span>
                <span className={styles.authorRole}>
                  {forumPost.author.role}
                </span>
              </div>
            </div>
            <div className={styles.postInfo}>
              <span className={styles.postDate}>
                {new Date(forumPost.createdAt).toLocaleDateString()}
              </span>
              <span className={styles.postStatus}>{forumPost.status}</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className={styles.postContent}>
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: forumPost.content }}
          />
        </div>

        {/* Replies Section */}
        <div className={styles.repliesSection}>
          <div className={styles.repliesHeader}>
            <h3>Replies ({forumPost.replies.length})</h3>
          </div>

          {forumPost.replies.length > 0 ? (
            <div className={styles.replies}>
              {forumPost.replies.map((reply) => (
                <ReplyItem key={reply._id} reply={reply} />
              ))}
            </div>
          ) : (
            <div className={styles.noReplies}>
              <p>No replies yet. Be the first to reply!</p>
            </div>
          )}

          {/* Reply Form */}
          <div className={styles.replyFormSection}>
            <h4>Add a Reply</h4>
            <ForumReplyForm postId={postId} addReply={validatePath} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ForumPostDetailPage;
