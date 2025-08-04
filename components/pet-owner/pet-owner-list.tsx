import React from "react";
import PetOwnerItem from "./pet-owner-item";
import styles from "./pet-owner-list.module.css";

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

type PetOwnerListProps = {
  interestedUsers: InterestedUser[];
};

const PetOwnerList: React.FC<PetOwnerListProps> = ({ interestedUsers }) => {
  if (interestedUsers.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyMessage}>
          No interested pet owners at the moment.
        </p>
        <p className={styles.emptySubtext}>
          Pet owners who show interest in your veterinary services will appear
          here.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.petOwnerList}>
      <div className={styles.listHeader}>
        <span className={styles.count}>
          {interestedUsers.length} interested pet owner
          {interestedUsers.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className={styles.grid}>
        {interestedUsers.map((interestedUser) => (
          <PetOwnerItem
            key={interestedUser.user._id}
            interestedUser={interestedUser}
          />
        ))}
      </div>
    </div>
  );
};

export default PetOwnerList;
