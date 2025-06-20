import React from 'react';
import styles from './styles/SuccessPopup.module.css';

interface SuccessPopupProps {
  message: string;
  onClose: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ message, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.icon}>✅</div>
        <h2 className={styles.title}>Success!</h2>
        <p className={styles.message}>{message}</p>
        <button onClick={onClose} className={styles.okButton}>
          Okay
        </button>
      </div>
    </div>
  );
};
export default SuccessPopup;