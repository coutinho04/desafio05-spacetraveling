import Link from 'next/link';

import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <a >
            <img src="/logo.png" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  )
}
