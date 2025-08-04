"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FaTimes, FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { type LostPet } from "@/lib/types";
import Modal from "../ui/modal";
import ErrorModal from "../ui/error";
import styles from "./lost-pet-item.module.css";
import Button from "../custom-elements/button";
import { useAuth } from "@/context/auth-context";
import { useHttp } from "@/lib/request-hook";
import LoadingSpinner from "../ui/loading-spinner";

type LostPetItemProps = {
  pet: LostPet;
};

type LostPetItemResponse = {
  success: boolean;
};

const LostPetItem = ({ pet }: LostPetItemProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const { isLoading, sendRequest, error, clearError } =
    useHttp<LostPetItemResponse>();
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleFound = async () => {
    try {
      const res = await sendRequest(
        `/api/lost-found/${pet._id}`,
        "POST",
        null,
        {
          "Content-Type": "application/json",
        }
      );
      if (res?.success) {
        setShowModal(true);
      }
    } catch {}
  };

  const closeModal = () => {
    setShowModal(false);
    clearError();
  };

  return (
    <>
      {/* Error Modal */}
      {error && <ErrorModal error={error} clearError={clearError} />}

      {/* Success Modal */}
      {showModal && (
        <Modal>
          <div className={styles.modalInner}>
            <button
              className={styles.modalClose}
              onClick={closeModal}
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className={styles.modalHeader}>
              <FaCheckCircle className={styles.modalIcon} />
              <h2>Interest Sent!</h2>
            </div>

            <div className={styles.modalBody}>
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <p>
                  We’ve notified the pet owner of your alert. They’ll reach out
                  soon! Thankyou for helping.
                </p>
              )}
            </div>

            <div className={styles.modalFooter}>
              <Button onClick={closeModal}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

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

              <p className={styles.adoptionCardAction}>
                {user?.userId === pet.owner._id ? (
                  <>
                    <Button
                      className={styles.editAdoption}
                      onClick={() =>
                        router.push(`/adoption/my-post/${pet._id}/edit`)
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      className={styles.deleteAdoption}
                      onClick={() =>
                        router.push(`/adoption/my-post/${pet._id}/delete`)
                      }
                    >
                      Delete
                    </Button>
                  </>
                ) : (
                  <Button className={styles.showInterest} onClick={handleFound}>
                    Found Alert
                  </Button>
                )}
              </p>
            </div>
          </div>
        </div>
      </li>
    </>
  );
};

export default LostPetItem;
