"use client";
import React, { useState, useMemo } from "react";
import ForumPostItem from "./forum-item";
import { ForumPost } from "@/lib/types";
import styles from "./forum-list.module.css";

interface ForumPostListProps {
  posts: ForumPost[];
  onPostClick?: (post: ForumPost) => void;
  loading?: boolean;
}

const ForumPostList: React.FC<ForumPostListProps> = ({
  posts,
  onPostClick,
  loading = false,
}) => {
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "replies">(
    "newest"
  );
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = useMemo(() => {
    const cats = ["all", ...new Set(posts.map((post) => post.category))];
    return cats;
  }, [posts]);

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;

    if (filterCategory !== "all") {
      filtered = filtered.filter((post) => post.category === filterCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort posts
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "replies":
          return b.replies.length - a.replies.length;
        default:
          return 0;
      }
    });
  }, [posts, sortBy, filterCategory, searchTerm]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={styles.loadingItem}>
            <div className={styles.loadingHeader}>
              <div className={styles.loadingAvatar}></div>
              <div className={styles.loadingAuthorInfo}>
                <div className={styles.loadingName}></div>
                <div className={styles.loadingRole}></div>
              </div>
            </div>
            <div className={styles.loadingContent}>
              <div className={styles.loadingTitle}></div>
              <div className={styles.loadingText}></div>
              <div className={styles.loadingTextShort}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.controlsContent}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <svg
              className={styles.searchIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className={styles.filters}>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={styles.select}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all"
                    ? "All Categories"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "newest" | "oldest" | "replies")
              }
              className={styles.select}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="replies">Most Replies</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.resultsCount}>
        Showing {filteredAndSortedPosts.length} of {posts.length} posts
      </div>
      <div className={styles.postsContainer}>
        {filteredAndSortedPosts.length === 0 ? (
          <div className={styles.emptyState}>
            <svg
              className={styles.emptyIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            <h3 className={styles.emptyTitle}>No posts found</h3>
            <p className={styles.emptyDescription}>
              {searchTerm || filterCategory !== "all"
                ? "Try adjusting your search or filters."
                : "Be the first to create a post!"}
            </p>
          </div>
        ) : (
          filteredAndSortedPosts.map((post) => (
            <ForumPostItem key={post._id} post={post} onClick={onPostClick} />
          ))
        )}
      </div>
    </div>
  );
};

export default ForumPostList;
