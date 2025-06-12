import Link from "next/link";
import styles from "./auth-footer.module.css";

const Footer = () => {
  return (
    <div className={styles.footer}>
      <p>By signing in, you agree to our</p>
      <div className={styles.footerLinks}>
        <Link href="/terms" className={styles.footerLink}>
          Terms of Service
        </Link>
        <span className={styles.footerSeparator}>•</span>
        <Link href="/privacy" className={styles.footerLink}>
          Privacy Policy
        </Link>
      </div>
    </div>
  );
};
export default Footer;
