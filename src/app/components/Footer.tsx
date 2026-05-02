import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.disclaimer}>
          <p>
            <strong>Disclaimer:</strong> JOSAADecoded is an independent platform and is{" "}
            <span className={styles.highlight}>NOT associated with or endorsed by JOSAA</span>{" "}
            (Joint Seat Allocation Authority) or the Ministry of Education, Government of India.
            All data is sourced from officially published public records and is provided for
            informational purposes only.
          </p>
        </div>
        <div className={styles.credits}>
          <p>&copy; {new Date().getFullYear()} JOSAADecoded. Developed by Thora.</p>
        </div>
      </div>
    </footer>
  );
}
