import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  FaEnvelope,
  FaPhone,
  FaHome,
  FaUser,
  FaBirthdayCake,
  FaCalendarAlt,
} from "react-icons/fa";
import { type PetOwner } from "@/lib/types";
import styles from "./page.module.css";
import UserProfileAction from "@/components/user/user-profile-actions";

type UserProfilePageProps = {
  params: Promise<{ slug: string }>;
};
const UserProfilePage = async ({ params }: UserProfilePageProps) => {
  const { slug } = await params;
  let user: PetOwner;
  try {
    const cookieHeader = (await cookies()).toString();
    const res = await fetch(`${process.env.NEXT_ROUTE_URL}/api/user/${slug}`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(
        "Could not get the user details for the moment. Please try again"
      );
    }
    const json = await res.json();
    user = json.data;
  } catch (error) {
    console.error(error);
    throw new Error(
      "Couldn't fetch the user details. Please check and try again"
    );
  }

  if (!user) notFound();

  const calculateAccountAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? "month" : "months"}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? "year" : "years"}`;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.header}>
          <div className={styles.imageContainer}>
            <Image
              src={user.profileImage.url}
              alt={`${user.name}'s profile`}
              className={styles.profileImage}
              width={200}
              height={200}
            />
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.name}>{user.name}</h1>
            <span className={styles.role}>{user.role}</span>
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailCard}>
              <div className={styles.detailIcon}>
                <FaEnvelope size={24} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{user.email}</span>
              </div>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.detailIcon}>
                <FaPhone size={24} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.label}>Phone</span>
                <span className={styles.value}>{user.phone}</span>
              </div>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.detailIcon}>
                <FaHome size={24} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.label}>Address</span>
                <span className={styles.value}>{user.address}</span>
              </div>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.detailIcon}>
                <FaUser size={24} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.label}>User ID</span>
                <span className={styles.value}>{user.userId}</span>
              </div>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.detailIcon}>
                <FaBirthdayCake size={24} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.label}>Age</span>
                <span className={styles.value}>
                  {calculateAccountAge(user.dob)}
                </span>
              </div>
            </div>

            <div className={styles.detailCard}>
              <div className={styles.detailIcon}>
                <FaCalendarAlt size={24} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.label}>Member Since</span>
                <span className={styles.value}>
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <UserProfileAction userId={slug} />
      </div>
    </div>
  );
};

export default UserProfilePage;
