import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { xml } from '@codemirror/lang-xml';
import styles from './styles/EditorView.module.css';
import SuccessPopup from './SuccessPopup';

interface EditorViewProps {
  filePath: string;
  onGoBack: () => void;
}

const EditorView: React.FC<EditorViewProps> = ({ filePath, onGoBack }) => {
  const [content, setContent] = useState<string>('Loading file...');
  const [isDirty, setIsDirty] = useState(false); // Track if there are unsaved changes
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // 1. Load the file content when the component mounts
  useEffect(() => {
    const loadFile = async () => {
      const fileContent = await window.api.readFile(filePath);
      if (fileContent !== null) {
        setContent(fileContent);
      } else {
        setContent('Error: Could not load file content.');
      }
    };
    loadFile();
  }, [filePath]);

  // 2. Handle saving the file
  const handleSave = async () => {
    console.log('Saving file...');
    const result = await window.api.writeFile(filePath, content);
    if (result.status === 'success') {
      setIsDirty(false); // Mark as no longer dirty
      setShowSuccessPopup(true); // Show success message
    } else {
      alert(`Error saving file: ${result.message}`);
    }
  };

  // 3. Handle the back button click
  const handleBack = () => {
    if (isDirty) {
      // In a real app, you'd show a "Confirm/Cancel" popup here.
      // For simplicity, we'll use the browser's built-in confirm dialog.
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        onGoBack();
      }
    } else {
      onGoBack();
    }
  };

  return (
    <div className={styles.wrapper}>
      {showSuccessPopup && (
        <SuccessPopup message="File saved successfully!" onClose={onGoBack} />
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Edit Document</h1>
        <div className={styles.actions}>
          <button onClick={handleBack} className={`${styles.button} ${styles.backButton}`}>
            ← Back
          </button>
          <button onClick={handleSave} className={`${styles.button} ${styles.saveButton}`}>
            Save Changes
          </button>
        </div>
      </div>

      <div className={styles.editorContainer}>
        <CodeMirror
          value={content}
          height="100%"
          extensions={[xml()]}
          onChange={(value) => {
            setContent(value);
            setIsDirty(true); // Mark as dirty when user types
          }}
          theme="dark" // Use a built-in dark theme
        />
      </div>
    </div>
  );
};

export default EditorView;