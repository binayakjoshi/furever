import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ForumPost } from "@/lib/types";
import styles from "./forum-item.module.css";

interface ForumPostItemProps {
  post: ForumPost;
  onClick?: (post: ForumPost) => void;
}

const ForumPostItem = ({ post, onClick }: ForumPostItemProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryClassName = (category: string) => {
    const categoryMap = {
      emergency: styles.emergency,
      health: styles.health,
      behavior: styles.behavior,
      nutrition: styles.nutrition,
      general: styles.general,
    };
    return categoryMap[category as keyof typeof categoryMap] || styles.general;
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
    <div
      className={`${styles.postItem} ${onClick ? styles.clickable : ""}`}
      onClick={() => onClick && onClick(post)}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.authorInfo}>
          <div className={styles.avatar}>
            <Image
              src={post.author.profileImage.url}
              alt={post.author._id}
              width={40}
              height={40}
              className={styles.avatarImage}
            />
          </div>
          <div className={styles.authorDetails}>
            <Link href={`/pet-owners/${post.author._id}`}>
              <h3>{post.author.name}</h3>
            </Link>
            <div className={styles.authorMeta}>
              <span
                className={`${styles.roleBadge} ${getRoleClassName(
                  post.author.role
                )}`}
              >
                {post.author.role.replace("-", " ")}
              </span>
              <span className={styles.timestamp}>
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <span
          className={`${styles.categoryBadge} ${getCategoryClassName(
            post.category
          )}`}
        >
          {post.category}
        </span>
      </div>

      {/* Post Content */}
      <div className={styles.content}>
        <Link href={`/pet-forum/post/${post._id}`}>
          <h2 className={styles.title}>{post.title}</h2>
        </Link>

        <p className={styles.description}>{post.content}</p>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <span className={styles.replyCount}>
            <svg
              className={styles.replyIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {post.replies.length}{" "}
            {post.replies.length === 1 ? "Reply" : "Replies"}
          </span>
          <span
            className={`${styles.statusBadge} ${
              post.status === "active" ? styles.active : styles.inactive
            }`}
          >
            {post.status}
          </span>
        </div>
        {post.updatedAt !== post.createdAt && (
          <span className={styles.updatedTime}>
            Updated: {formatDate(post.updatedAt)}
          </span>
        )}
      </div>
    </div>
  );
};

export default ForumPostItem;
