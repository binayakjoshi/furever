import React from "react";
import { FaUser, FaPhone, FaEnvelope } from "react-icons/fa";
import Image from "next/image";
import Button from "../custom-elements/button";
import styles from "./pet-owner-item.module.css";

type InterestedUser = {
  user: {
    profileImage?: {
      url: string;
      publicId: string;
    };
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  dateExpressed: string;
};

type PetOwnerItemProps = {
  interestedUser: InterestedUser;
};

const PetOwnerItem: React.FC<PetOwnerItemProps> = ({ interestedUser }) => {
  const { user, dateExpressed } = interestedUser;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatExpressedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    } else {
      return formatDate(dateString);
    }
  };

  return (
    <div className={styles.petOwnerCard}>
      <div className={styles.profileSection}>
        <div className={styles.profileImage}>
          {user.profileImage?.url ? (
            <Image
              src={user.profileImage.url}
              alt={`${user.name}'s profile`}
              className={styles.avatar}
              width={100}
              height={100}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <FaUser />
            </div>
          )}
        </div>
        <div className={styles.basicInfo}>
          <h3 className={styles.name}>{user.name}</h3>
          <p className={styles.role}>Pet Owner</p>
        </div>
      </div>

      <div className={styles.contactInfo}>
        <div className={styles.infoItem}>
          <FaEnvelope className={styles.infoIcon} />
          <span>{user.email}</span>
        </div>

        <div className={styles.infoItem}>
          <FaPhone className={styles.infoIcon} />
          <span>{user.phone}</span>
        </div>
      </div>

      <div className={styles.memberSince}>
        <span className={styles.memberLabel}>Expressed interest:</span>
        <span className={styles.memberDate}>
          {formatExpressedDate(dateExpressed)}
        </span>
      </div>

      <div className={styles.actions}>
        <Button
          className={styles.viewProfileButton}
          href={`/pet-owners/${interestedUser.user._id}`}
        >
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default PetOwnerItem;
