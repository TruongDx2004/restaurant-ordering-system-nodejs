import React from 'react';
import { useGuestMode } from '../hooks';
import styles from './GuestAccess.module.css';

/**
 * Guest Access Component
 * Allows users to continue without authentication
 */
const GuestAccess = () => {
  const { continueAsGuest } = useGuestMode();

  return (
    <div className={styles.guestContainer}>
      <div className={styles.divider}>
        <span className={styles.dividerText}>Hoặc</span>
      </div>
      
      <button 
        type="button"
        className={styles.guestButton}
        onClick={continueAsGuest}
      >
        <svg 
          className={styles.guestIcon} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
          />
        </svg>
        Tiếp tục với tư cách khách
      </button>
      
      <p className={styles.guestNote}>
        Luu y: Ban co the xem va dat mon, nhung khong luu lich su don hang
      </p>
    </div>
  );
};

export default GuestAccess;
