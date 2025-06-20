import React, { useState } from 'react';
import styles from './styles/FileInput.module.css';

declare global {
  interface Window {
    api: {
      openFile: () => Promise<{ path: string; type: 'file' | 'folder' } | null>;
      parseXML: (filePath: string) => Promise<{ status: 'success', data: any } | { status: 'error', message: string }>;
      readFile: (filePath: string) => Promise<string | null>;
      writeFile: (filePath: string, content: string) => Promise<{ status: 'success' } | { status: 'error', message: string }>;
    };
  }
}

interface FileInputProps {
    onSelection: (selection: { path: string; type: 'file' | 'folder' } | null) => void;
}

const FileInput: React.FC<FileInputProps> = ({ onSelection }) => {
    const [filePath, setFilePath] = useState<string>('');

    const handleBrowseClick = async () => {
        const selection = await window.api.openFile();
        if (selection) {
            setFilePath(selection.path);
            onSelection(selection);
        } else {
            setFilePath('');
            onSelection(null);
        }
    };

    return (
        <div className={styles.container}>
            <label htmlFor="file-path" className={styles.label}>
                Select XML File or Folder
            </label>
            <div className={styles.inputWrapper}>
                <input
                    type="text"
                    id="file-path"
                    readOnly
                    value={filePath}
                    placeholder="No file or folder selected..."
                    className={styles.filePathInput}
                />
                <button
                    onClick={handleBrowseClick}
                    className={styles.browseButton}
                >
                    Browse...
                </button>
            </div>
        </div>
    );
};

export default FileInput;