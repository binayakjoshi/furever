import { FormEvent } from "react";
import {
  FaEnvelope,
  FaCommentDots,
  FaRobot,
  FaQuestionCircle,
} from "react-icons/fa";
import ContactForm from "@/components/forms/contact-form";
import styles from "./page.module.css";

const ContactPage = () => {
  return (
    <div className={styles.container}>
      <section className={styles.introSection}>
        <h1 className={styles.introTitle}>Contact Us</h1>
        <p className={styles.introContent}>
          Get in touch with our support team. We&apos;re here to help pet
          owners, veterinarians, and people interested in adopting, connect and
          thrive as a community.
        </p>
      </section>
      <section className={styles.gridContent}>
        <div className={styles.contactInfo}>
          <h2 className={styles.contactTitle}>Get in Touch</h2>
          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>
              <FaEnvelope size={20} />
            </div>
            <div className={styles.contactDetails}>
              <h3>Email Support</h3>
              <p>
                General: <a href="mailto:binayakj@pm.me">binayakj@pm.me</a>
                <br />
                Veterinarians:{" "}
                <a href="mailto:bhatta.abhaya14@gmail.com">
                  bhatta.abhaya14@gmail.com
                </a>
                <br />
                Adoption:{" "}
                <a href="mailto:pahadipragyan@gmail.com">
                  pahadipragyan@gmail.com
                </a>
              </p>
            </div>
          </div>
          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>
              <FaCommentDots size={20} />
            </div>
            <div className={styles.contactDetails}>
              <h3>Community Forum</h3>
              <p>
                Join our pet owner community forum for peer support, advice, and
                discussions about pet care.
              </p>
            </div>
          </div>
          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>
              <FaRobot size={20} />
            </div>
            <div className={styles.contactDetails}>
              <h3>AI Assistant</h3>
              <p>
                Available 24/7 for instant answers to common questions about pet
                care, platform features, and more.
              </p>
            </div>
          </div>
          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>
              <FaQuestionCircle size={20} />
            </div>
            <div className={styles.contactDetails}>
              <h3>Response Time</h3>
              <p>
                We typically respond to inquiries within 24 hours during
                business days. For urgent matters, please use our AI assistant.
              </p>
            </div>
          </div>
        </div>
        <ContactForm />
      </section>
    </div>
  );
};

export default ContactPage;
