import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  FaCalendar,
  FaHeart,
  FaUser,
  FaStethoscope,
  FaDog,
  FaSyringe,
  FaExclamationTriangle,
} from "react-icons/fa";
import PetDetailAction from "@/components/pets/pet-detail-actions";
import { Pet } from "@/components/pets/pet-type";
import styles from "./page.module.css";

type PetDetailPageProps = { params: Promise<{ petSlug: string }> };

const PetDetailPage = async ({ params }: PetDetailPageProps) => {
  const { petSlug } = await params;
  let pet: Pet;

  try {
    const cookieHeader = (await cookies()).toString();
    const res = await fetch(
      `${process.env.NEXT_ROUTE_URL}/api/pets/${petSlug}`,
      {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      }
    );
    if (res.status === 401) {
      redirect("/login");
    }
    if (!res.ok) {
      throw new Error(
        "Could not get the pet details for the moment. Please try again"
      );
    }
    const json = await res.json();
    pet = json.data;
  } catch (error) {
    console.error(error);
    throw new Error(
      "Couldn't fetch the pet details for the pet Id. Please check and try again"
    );
  }

  if (!pet) notFound();

  const dob = new Date(pet.dob);
  const age = Math.floor(
    (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const isVaccinationDueSoon = (nextVaccDate: string) => {
    const nextDate = new Date(nextVaccDate);
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.imageContainer}>
          <Image
            src={pet.image.url}
            alt={`${pet.name}-image`}
            height={300}
            width={300}
            className={styles.petImage}
          />
        </div>
        <div className={styles.headerInfo}>
          <h1 className={styles.petName}>{pet.name}</h1>
          <div className={styles.basicInfo}>
            <span className={styles.petType}>{pet.petType || "Pet"}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.breed}>{pet.breed}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.age}>{age} years old</span>
          </div>
        </div>
      </div>
      {pet.description && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FaHeart className={styles.sectionIcon} />
            About {pet.name}
          </h2>
          <p className={styles.description}>{pet.description}</p>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <FaUser className={styles.sectionIcon} />
          General Information
        </h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <FaCalendar className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <span className={styles.label}>Date of Birth</span>
              <span className={styles.value}>{formatDate(pet.dob)}</span>
            </div>
          </div>
          <div className={styles.infoItem}>
            <FaDog className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <span className={styles.label}>Breed</span>
              <span className={styles.value}>{pet.breed}</span>
            </div>
          </div>
          {pet.petType && (
            <div className={styles.infoItem}>
              <FaHeart className={styles.infoIcon} />
              <div className={styles.infoContent}>
                <span className={styles.label}>Type</span>
                <span className={styles.value}>{pet.petType}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {pet.vaccinations && pet.vaccinations.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FaSyringe className={styles.sectionIcon} />
            Vaccinations
          </h2>
          <div className={styles.vaccinationGrid}>
            {pet.vaccinations.map((vaccination, index) => (
              <div
                key={index}
                className={`${styles.vaccinationCard} ${
                  isVaccinationDueSoon(vaccination.nextVaccDate)
                    ? styles.dueSoon
                    : ""
                }`}
              >
                <div className={styles.vaccinationHeader}>
                  <h3 className={styles.vaccinationName}>{vaccination.name}</h3>
                  {isVaccinationDueSoon(vaccination.nextVaccDate) && (
                    <FaExclamationTriangle className={styles.warningIcon} />
                  )}
                </div>
                <div className={styles.vaccinationDates}>
                  <div className={styles.vaccinationDate}>
                    <span className={styles.dateLabel}>Last Given:</span>
                    <span className={styles.dateValue}>
                      {formatDate(vaccination.vaccDate)}
                    </span>
                  </div>
                  <div className={styles.vaccinationDate}>
                    <span className={styles.dateLabel}>Next Due:</span>
                    <span className={styles.dateValue}>
                      {formatDate(vaccination.nextVaccDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pet.diseases && pet.diseases.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FaStethoscope className={styles.sectionIcon} />
            Health Conditions
          </h2>
          <div className={styles.diseasesList}>
            {pet.diseases.map((disease, index) => (
              <span key={index} className={styles.diseaseTag}>
                {disease}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className={styles.actionsSection}>
        <PetDetailAction petId={petSlug} />
      </div>
    </div>
  );
};

export default PetDetailPage;
