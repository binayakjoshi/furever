import Image from "next/image";
import Link from "next/link";
import { type Vet } from "@/lib/types";
import styles from "./vet-item.module.css";

type VetItemProps = {
  vet: Vet;
};

const VetItem = ({ vet }: VetItemProps) => {
  return (
    <>
      <Link href={`/vets/${vet.userId}`}>
        <li className={styles.card}>
          <div className={styles.cardContent}>
            <div className={styles.imageWrapper}>
              <Image
                src={vet.profileImage.url}
                alt={vet.name}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 200px, 280px"
                className={styles.image}
              />
            </div>

            {/* Details Section */}
            <div className={styles.content}>
              <h2 className={styles.heading}>{vet.name}</h2>
              <div className={styles.metaContainer}>
                <p className={styles.meta}>
                  <span className={styles.value}>{vet.degree}</span>
                </p>
                <p className={styles.meta}>
                  <span className={styles.label}>Experience:</span>
                  <span className={styles.value}>
                    {vet.experience} {vet.experience === "1" ? "Year" : "Years"}
                  </span>
                </p>
                <p className={styles.meta}>
                  <span className={styles.label}>Available:</span>
                  <span className={styles.value}>{vet.availability}</span>
                </p>
                <p className={styles.meta}>
                  <span className={styles.label}>License</span>
                  <span className={styles.value}>{vet.licenseNumber}</span>
                </p>
                {/* <p className={styles.meta}>
                <span className={styles.label}>Contact:</span>
                <span className={styles.value}>{vet.contactInfo}</span>
              </p> */}
              </div>
            </div>
          </div>
        </li>
      </Link>
    </>
  );
};

export default VetItem;
