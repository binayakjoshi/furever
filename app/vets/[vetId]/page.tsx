import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  FaEnvelope,
  FaUniversity,
  FaClock,
  FaBriefcase,
  FaIdBadge,
  FaCalendarAlt,
} from "react-icons/fa";
import { Vet } from "@/lib/types";
import styles from "./page.module.css";
import VetProfileAction from "@/components/vets/vet-profile-action";

type VetProfilePageProps = {
  params: Promise<{ vetId: string }>;
};

const VetProfilePage = async ({ params }: VetProfilePageProps) => {
  const { vetId } = await params;
  let vet: Vet;

  try {
    const cookieHeader = (await cookies()).toString();
    const res = await fetch(`${process.env.NEXT_ROUTE_URL}/api/vets/${vetId}`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(
        "Could not get the vet details at the moment. Please try again."
      );
    }

    const json = await res.json();
    vet = json;
  } catch (error) {
    console.error(error);
    throw new Error(
      "Couldn't fetch the Vet details. Please check and try again."
    );
  }
  if (!vet) notFound();

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.header}>
          <div className={styles.imageContainer}>
            <Image
              src={vet.profileImage.url}
              alt={`${vet.name}'s profile`}
              className={styles.profileImage}
              width={200}
              height={200}
            />
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.name}>{vet.name}</h1>
            <span className={styles.role}>{vet.role}</span>
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.detailsGrid}>
            {/* Email */}
            <div className={styles.detailCard}>
              <div className={styles.detailIcon}>
                <FaEnvelope size={24} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{vet.email}</span>
              </div>
            </div>

            {/* License Number */}
            <div className={styles.detailCard}>
              <div className={styles.detailIcon}>
                <FaIdBadge size={24} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.label}>License No.</span>
                <span className={styles.value}>{vet.licenseNumber}</span>
              </div>
            </div>

            {/* Degree */}
            <div className={styles.detailCard}>
              <div className={styles.detailIcon}>
                <FaUniversity size={24} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.label}>Degree</span>
                <span className={styles.value}>{vet.degree}</span>
              </div>
            </div>

            {/* Availability */}
            <div className={styles.detailCard}>
              <div className={styles.detailIcon}>
                <FaClock size={24} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.label}>Availability</span>
                <span className={styles.value}>{vet.availability}</span>
              </div>
            </div>

            {/* Experience */}
            <div className={styles.detailCard}>
              <div className={styles.detailIcon}>
                <FaBriefcase size={24} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.label}>Experience</span>
                <span className={styles.value}>{vet.experience} Years</span>
              </div>
            </div>

            {/* Member Since */}
            <div className={styles.detailCard}>
              <div className={styles.detailIcon}>
                <FaCalendarAlt size={24} />
              </div>
              <div className={styles.detailContent}>
                <span className={styles.label}>Member Since</span>
                <span className={styles.value}>
                  {new Date(vet.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <VetProfileAction userId={vet.userId} />
      </div>
    </div>
  );
};

export default VetProfilePage;
