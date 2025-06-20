import React from 'react';
import styles from './styles/ActionButton.module.css';


interface ActionButtonProps {
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
    isDisabled: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ title, description, isSelected, onClick, isDisabled }) => {
    const buttonClassName = `
    ${styles.actionButton} 
    ${isSelected ? styles.selected : ''}
    ${isDisabled ? styles.disabled : ''}
  `;

    return (
        <div onClick={!isDisabled ? onClick : undefined} className={buttonClassName.trim()}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
        </div>
    );
};

export default ActionButton;