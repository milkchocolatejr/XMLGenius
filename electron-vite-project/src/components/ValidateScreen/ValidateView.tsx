import React, { useState } from 'react';
import styles from './styles/ValidateView.module.css';
import SuccessPopup from './SuccessPopup';

interface ValidateViewProps {
    path: string;
    selectionType: 'file' | 'folder';
    validationData: {
        isValid: boolean | null;
        validationMessage: string;
        folderResults: any[];
        isValidating: boolean;
    };
    onGoBack: () => void;
}

const ValidateView: React.FC<ValidateViewProps> = ({ 
    path, 
    selectionType, 
    validationData, 
    onGoBack 
}) => {
    const { isValid, validationMessage, folderResults, isValidating } = validationData;
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const handleRepair = async (type: 'top' | 'bottom') => {
        console.log(`Attempting repair type '${type}' on file: ${path}`);
        try {
            const response = await fetch('http://127.0.0.1:8000/repair', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filePath: path, repairType: type })
            });

            if (!response.ok) throw new Error('Repair request failed');
            
            const result = await response.json();
            console.log('Repair response:', result);
            setShowSuccessPopup(true);

        } catch (error) {
            console.error("Failed to run repair:", error);
            alert("An error occurred during the repair process.");
        }
    };

    return (
        <div className={styles.wrapper}>
            {showSuccessPopup && (
                <SuccessPopup 
                    message="The file has been repaired. Returning to the home screen."
                    onClose={onGoBack}
                />
            )}

            <div className={styles.header}>
                <h1 className={styles.title}>XML Validation Results</h1>
                <button onClick={onGoBack} className={styles.goBackButton}>
                    ← Go Back
                </button>
            </div>

            <div className={styles.content}>
                <div className={styles.pathInfo}>
                    <span className={styles.pathLabel}>
                        {selectionType === 'file' ? '📄 File:' : '📁 Folder:'}
                    </span>
                    <span className={styles.pathValue}>{path}</span>
                </div>

                {isValidating ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <div className={styles.loadingText}>
                            {selectionType === 'folder' ? 'Validating XML files in folder...' : 'Validating XML...'}
                        </div>
                    </div>
                ) : selectionType === 'file' ? (
                    <div className={styles.fileResults}>
                        <div className={`${styles.statusCard} ${isValid ? styles.valid : styles.invalid}`}>
                            <div className={styles.statusIcon}>
                                {isValid ? '✅' : '❌'}
                            </div>
                            <div className={styles.statusText}>
                                <h2>{isValid ? 'Valid XML Document' : 'Invalid XML Document'}</h2>
                                {!isValid && validationMessage && (
                                    <div className={styles.errorDetails}>
                                        <h3>Error Details:</h3>
                                        <pre className={styles.errorMessage}>{validationMessage}</pre>
                                        
                                        <div className={styles.repairActions}>
                                            <p>Attempt to fix the mismatched tags?</p>
                                            <button onClick={() => handleRepair('top')} className={styles.repairButton}>
                                                Repair with Top
                                            </button>
                                            <button onClick={() => handleRepair('bottom')} className={styles.repairButton}>
                                                Repair with Bottom
                                            </button>
                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Folder validation results
                    <div className={styles.folderResults}>
                        <div className={styles.summaryCard}>
                            <h2>Validation Summary</h2>
                            <div className={styles.summaryStats}>
                                <div className={styles.stat}>
                                    <span className={styles.statNumber}>{folderResults.length}</span>
                                    <span className={styles.statLabel}>Total XML Files</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={`${styles.statNumber} ${styles.valid}`}>
                                        {folderResults.filter(f => f.valid).length}
                                    </span>
                                    <span className={styles.statLabel}>Valid Files</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={`${styles.statNumber} ${styles.invalid}`}>
                                        {folderResults.filter(f => !f.valid).length}
                                    </span>
                                    <span className={styles.statLabel}>Invalid Files</span>
                                </div>
                            </div>
                        </div>

                        {folderResults.length > 0 && (
                            <div className={styles.fileList}>
                                <h3>File Details</h3>
                                <div className={styles.fileListContainer}>
                                    {folderResults.map((file, index) => (
                                        <div 
                                            key={index} 
                                            className={`${styles.fileItem} ${file.valid ? styles.validFile : styles.invalidFile}`}
                                        >
                                            <div className={styles.fileIcon}>
                                                {file.valid ? '✅' : '❌'}
                                            </div>
                                            <div className={styles.fileName}>
                                                {file.fileName}
                                            </div>
                                            <div className={styles.fileStatus}>
                                                {file.valid ? 'Valid' : 'Invalid'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ValidateView;
