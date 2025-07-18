import Image from "next/image";
import Link from "next/link";
import { ForumReply } from "@/lib/types";
import styles from "./forum-reply-item.module.css";

interface ReplyItemProps {
  reply: ForumReply;
}

const ReplyItem = ({ reply }: ReplyItemProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleClassName = (role: string) => {
    const roleMap = {
      "pet-owner": styles.petOwner,
      veterinarian: styles.veterinarian,
      admin: styles.admin,
    };
    return roleMap[role as keyof typeof roleMap] || styles.default;
  };

  return (
    <div className={styles.replyItem}>
      <div className={styles.replyHeader}>
        <Link href={`/user/${reply.author._id}`}>
          <div className={styles.replyAuthorInfo}>
            <div className={styles.replyAvatar}>
              <Image
                src={reply.author.profileImage.url}
                alt={reply.author.name}
                width={32}
                height={32}
                className={styles.replyAvatarImage}
              />
            </div>
            <div className={styles.replyAuthorDetails}>
              <h4>{reply.author.name}</h4>
              <div className={styles.replyAuthorMeta}>
                <span
                  className={`${styles.replyRoleBadge} ${getRoleClassName(
                    reply.author.role
                  )}`}
                >
                  {reply.author.role.replace("-", " ")}
                </span>
                <span className={styles.replyTimestamp}>
                  {formatDate(reply.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <p className={styles.replyContent}>{reply.content}</p>
    </div>
  );
};

export default ReplyItem;
