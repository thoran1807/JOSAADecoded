import Link from "next/link";
import styles from "./Navbar.module.css";
import { GraduationCap, BarChart2, CheckSquare, AlignLeft, Info } from "lucide-react";

export default function Navbar() {
  return (
    <>
      <div className={styles.mobileHeader}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoHighlight}>JOSAA</span>Decoded
        </Link>
      </div>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link href="/" className={`${styles.logo} ${styles.desktopLogo}`}>
            <span className={styles.logoHighlight}>JOSAA</span>Decoded
          </Link>
          <div className={styles.links}>
            <Link href="/cutoffs" className={styles.navLink}>
              <BarChart2 size={20} /> <span>Cutoffs</span>
            </Link>
            <Link href="/predictor" className={styles.navLink}>
              <GraduationCap size={20} /> <span>Predictor</span>
            </Link>
            <Link href="/compare" className={styles.navLink}>
              <AlignLeft size={20} /> <span>Compare</span>
            </Link>
            <Link href="/guides" className={styles.navLink}>
              <CheckSquare size={20} /> <span>Guides</span>
            </Link>
            <Link href="/faq" className={styles.navLink}>
              <Info size={20} /> <span>FAQ</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
