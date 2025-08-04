"use client";
import React, { useState } from "react";
import Image from "next/image";
import { FaTimes, FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { type AdoptionPet } from "@/lib/types";
import Modal from "../ui/modal";
import ErrorModal from "../ui/error";
import styles from "./adoption-item.module.css";
import Button from "../custom-elements/button";
import { useAuth } from "@/context/auth-context";
import { useHttp } from "@/lib/request-hook";
import LoadingSpinner from "../ui/loading-spinner";

type AdoptionItemProps = {
  pet: AdoptionPet;
};

type AdoptionItemResponse = {
  success: boolean;
};

const AdoptionItem = ({ pet }: AdoptionItemProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const { isLoading, sendRequest, error, clearError } =
    useHttp<AdoptionItemResponse>();
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleAdoption = async () => {
    try {
      const res = await sendRequest(`/api/adoption/${pet._id}`, "POST", null, {
        "Content-Type": "application/json",
      });
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
                  We’ve notified the pet owner of your interest. They’ll reach
                  out soon!
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
              <p className={styles.meta}>
                <span className={styles.label}>Requirements:</span>
                <span className={styles.value}>{pet.requirements}</span>
              </p>
              <p className={styles.adoptionCardAction}>
                {user?.userId === pet.creator ? (
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
                    <Button
                      onClick={() =>
                        router.push(`/adoption/my-post/${pet._id}`)
                      }
                    >
                      View Interested User
                    </Button>
                  </>
                ) : (
                  <Button
                    className={styles.showInterest}
                    onClick={handleAdoption}
                  >
                    Adopt
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

export default AdoptionItem;
