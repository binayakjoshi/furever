import Image from "next/image";
import Link from "next/link";
import { type Pet as PetItemProps } from "./pet-type";
import styles from "./pet-item.module.css";

const PetItem = (props: PetItemProps) => {
  const { _id, image, name, dob, petType, breed } = props;
  const date = new Date(dob);
  return (
    <li className={styles.card}>
      <Link href={`/pets/${_id}`}>
        <div className={styles.imageWrapper}>
          <Image
            src={image.url}
            alt={name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 300px) 100vw, 300px"
          />
        </div>
        <div className={styles.content}>
          <h2 className={styles.heading}>{name}</h2>
          <p className={styles.meta}>
            <strong>Date of Birth:</strong> {date.toLocaleDateString()}
          </p>
          <p className={styles.meta}>
            <strong>Type:</strong> {petType}
          </p>
          <p className={styles.meta}>
            <strong>Breed:</strong> {breed}
          </p>
        </div>
      </Link>
    </li>
  );
};

export default PetItem;
