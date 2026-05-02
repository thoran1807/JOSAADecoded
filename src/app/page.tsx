import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.gradientText}>JOSAA</span>Decoded
        </h1>
        <p className={styles.subtitle}>
          Stop guessing. Start strategizing. Navigate JEE counselling with powerful tools and data.
        </p>
      </header>

      <div className={styles.grid}>
        <Link href="/cutoffs" className={styles.card}>
          <h2>Cutoff Explorer &rarr;</h2>
          <p>Filter, sort, and analyze opening and closing ranks from 2019-2025.</p>
        </Link>

        <Link href="/predictor" className={styles.card}>
          <h2>College Predictor &rarr;</h2>
          <p>Enter your rank and category to see where you have the highest chances.</p>
        </Link>

        <Link href="/compare" className={styles.card}>
          <h2>Compare Colleges &rarr;</h2>
          <p>Put up to 4 colleges side-by-side and compare cutoffs, placements, and fees.</p>
        </Link>

        <Link href="/guides" className={styles.card}>
          <h2>Process Guide &rarr;</h2>
          <p>Step-by-step checklist and choice filling strategies.</p>
        </Link>
      </div>
    </main>
  );
}
