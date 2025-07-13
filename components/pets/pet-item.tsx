import Image from "next/image";
import Link from "next/link";
import { type Pet as PetItemProps } from "@/lib/types";
import styles from "./pet-item.module.css";

const PetItem = (props: PetItemProps) => {
  const { _id, image, name, dob, petType, breed } = props;
  const date = new Date(dob);

  return (
    <li className={styles.card}>
      <Link href={`/pets/${_id}`}>
        <div className={styles.cardContent}>
          <div className={styles.imageWrapper}>
            <Image
              src={image.url}
              alt={name}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 120px, 160px"
            />
          </div>
          <div className={styles.content}>
            <h2 className={styles.heading}>{name}</h2>
            <div className={styles.metaContainer}>
              <p className={styles.meta}>
                <span className={styles.label}>Born:</span>
                <span className={styles.value}>
                  {date.toLocaleDateString()}
                </span>
              </p>
              <p className={styles.meta}>
                <span className={styles.label}>Type:</span>
                <span className={styles.value}>{petType}</span>
              </p>
              <p className={styles.meta}>
                <span className={styles.label}>Breed:</span>
                <span className={styles.value}>{breed}</span>
              </p>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default PetItem;
