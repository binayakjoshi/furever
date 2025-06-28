import Link from "next/link";
import {
  FaHeart,
  FaMapMarkerAlt,
  FaUsers,
  FaCalendarAlt,
  FaCommentDots,
  FaRobot,
  FaShieldAlt,
} from "react-icons/fa";

import styles from "./page.module.css";
const AboutUsPage = () => {
  return (
    <>
      <section className={styles.intro}>
        <h1 className={styles.introTitle}>About Furever</h1>
        <p className={styles.paragraphContent}>
          Furever is a comprehensive Pet Care Platform with Geo Services and AI
          Assistance. We at furever work towards connecting pet owners,
          veterinarians, and pet adoption services. We are Everything you need
          for your pet&apos;s wellbeing in one place.
        </p>
      </section>
      <section className={styles.origin}>
        <h2 className={styles.originTitle}>Origin Story</h2>
        <p className={styles.paragraphContent}>
          Furever was born from a simple idea: pet care should be accessible,
          connected, and comprehensive. We recognized that pet owners often
          struggle to find reliable veterinary services, manage their pet&apos;s
          health records, and connect with other pet lovers in their community.
        </p>
        <p className={styles.paragraphContent}>
          Our platform bridges the gap between pet owners and veterinary
          professionals while creating a supportive community for pet adoption
          and care. Whether you&apos;re a new pet parent or an experienced
          owner, PetCare Connect provides the tools and connections you need.
        </p>
      </section>
      <section className={styles.features}>
        <h2 className={styles.featuresTitle}>Platform Features</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaHeart />
            </div>
            <h3 className={styles.featureTitle}>Pet Care Management</h3>
            <p className={styles.featureDescription}>
              Comprehensive pet profiles with vaccination record, pet details
              and medical history management.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaMapMarkerAlt />
            </div>
            <h3 className={styles.featureTitle}>Locate Nearby Vets</h3>
            <p className={styles.featureDescription}>
              Interactive map powered by OpenStreetMap to locate veterinary
              clinics and hospitals in your area.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaUsers />
            </div>
            <h3 className={styles.featureTitle}>Pet Adoption</h3>
            <p className={styles.featureDescription}>
              Connect pets in need with loving families. Post for an adoption or
              provide shelter a furry friend.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaCalendarAlt />
            </div>
            <h3 className={styles.featureTitle}>Book Vet Appointments</h3>
            <p className={styles.featureDescription}>
              Book veterinary appointments for your pet directly through the
              platform
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaCommentDots />
            </div>
            <h3 className={styles.featureTitle}>Community Forums</h3>
            <p className={styles.featureDescription}>
              Connect with fellow pet owners, ask questions, and share
              experiences in our supportive community.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaRobot />
            </div>
            <h3 className={styles.featureTitle}>AI Assistance</h3>
            <p className={styles.featureDescription}>
              Get instant answers to pet care questions with our intelligent AI
              support system available 24/7
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <FaShieldAlt />
            </div>
            <h3 className={styles.featureTitle}>Login with Goolge</h3>
            <p className={styles.featureDescription}>
              {" "}
              No Signup hassle,safe and convenient access to your account with
              Google authentication for enhanced security.
            </p>
          </div>
        </div>
      </section>
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Join the Furever Community</h2>
        <p className={styles.ctaText}>
          Connect with veterinarians, manage your pet&apos;s health, find
          adoption opportunities, and join thousands of pet lovers.
        </p>
        <Link href="/signup" className={styles.ctaButton}>
          Get Started Today
        </Link>
      </section>
    </>
  );
};
export default AboutUsPage;
