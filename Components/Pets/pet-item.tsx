import Image from "next/image";
import styles from "./pet-item.module.css";
import { type Pet as PetItemProps } from "./pet-type";
import Button from "../CustomElements/button";

const PetItem = (props: PetItemProps) => {
  const {
    image,
    name,
    age,
    petType,
    breed,
    lastVaccination,
    upcomingVaccination,
    description,
  } = props;

  return (
    <li className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={image}
          alt={name}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 300px) 100vw, 300px"
        />
      </div>
      <div className={styles.content}>
        <h2 className={styles.heading}>{name}</h2>
        <p className={styles.meta}>
          <strong>Age:</strong> {age}
        </p>
        <p className={styles.meta}>
          <strong>Type:</strong> {petType}
        </p>
        <p className={styles.meta}>
          <strong>Breed:</strong> {breed}
        </p>
        <p className={styles.meta}>
          <strong>Last Vaccination:</strong> {lastVaccination}
        </p>
        <p className={styles.meta}>
          <strong>Upcoming Vaccination:</strong> {upcomingVaccination}
        </p>
        <p className={styles.description}>{description}</p>
        <div className={styles.buttonGroup}>
          <Button className={`${styles.button} ${styles.editButton}`}>
            Edit
          </Button>
          <Button className={`${styles.button} ${styles.removeButton}`}>
            Remove
          </Button>
        </div>
      </div>
    </li>
  );
};

export default PetItem;
