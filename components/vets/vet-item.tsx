"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaTimes, FaCheckCircle } from "react-icons/fa";
import Modal from "../ui/modal";
import ErrorModal from "../ui/error";
import { useAuth } from "@/context/auth-context";
import { useHttp } from "@/lib/request-hook";
import LoadingSpinner from "../ui/loading-spinner";
import Button from "../custom-elements/button";
import { type Vet } from "@/lib/types";
import styles from "./vet-item.module.css";

type VetItemProps = {
  vet: Vet;
};
type VetItemResponse = {
  success: boolean;
};

const VetItem = ({ vet }: VetItemProps) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState<boolean>(false);
  const { isLoading, sendRequest, error, clearError } =
    useHttp<VetItemResponse>();

  const handleAppointment = async () => {
    try {
      const res = await sendRequest(`/api/vets/${vet.userId}`, "POST", null, {
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
      {error && <ErrorModal error={error} clearError={clearError} />}
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
              {user?.role === "pet-owner" && (
                <p className={styles.vetCardAction}>
                  <Button
                    className={styles.bookAppointment}
                    onClick={handleAppointment}
                  >
                    Appointment
                  </Button>
                </p>
              )}
            </div>
          </div>
        </li>
      </Link>
    </>
  );
};

export default VetItem;
