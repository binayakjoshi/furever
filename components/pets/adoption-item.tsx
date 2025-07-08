"use client";
import React from "react";
import Image from "next/image";
import { type AdoptionPet } from "./pet-type";
import styles from "./adoption-item.module.css";
import Button from "../custom-elements/button";
import { useAuth } from "@/context/auth-context";

type AdoptionItemProps = {
  pet: AdoptionPet;
};

const AdoptionItem = ({ pet }: AdoptionItemProps) => {
  const { user } = useAuth();

  return (
    <li className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.imageWrapper}>
          <Image
            src={pet.image.url}
            alt={pet.name}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 200px, 280px"
            className={styles.image}
          />
        </div>

        {/* Details Section */}
        <div className={styles.content}>
          <h2 className={styles.heading}>{pet.name}</h2>
          <div className={styles.metaContainer}>
            <p className={styles.meta}>
              <span className={styles.value}>{pet.description}</span>
            </p>
            <p className={styles.meta}>
              <span className={styles.label}>Breed:</span>
              <span className={styles.value}>{pet.breed}</span>
            </p>
            <p className={styles.meta}>
              <span className={styles.label}>Type:</span>
              <span className={styles.value}>{pet.petType}</span>
            </p>
            <p className={styles.meta}>
              <span className={styles.label}>Location:</span>
              <span className={styles.value}>{pet.location}</span>
            </p>
            <p className={styles.meta}>
              <span className={styles.label}>Contact:</span>
              <span className={styles.value}>{pet.contactInfo}</span>
            </p>
            <p className={styles.meta}>
              <span className={styles.label}>Requirements:</span>
              <span className={styles.value}>{pet.requirements}</span>
            </p>
            <p className={styles.adoptionCardAction}>
              {user?.userId === pet.creator._id ? (
                <>
                  <Button className={styles.editAdoption}>Edit</Button>
                  <Button className={styles.deleteAdoption}>Delete</Button>
                </>
              ) : (
                <Button className={styles.showInterest}>Adopt</Button>
              )}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
};

export default AdoptionItem;
