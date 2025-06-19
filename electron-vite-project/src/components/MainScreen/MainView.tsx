import { useState } from 'react';
import FileInput from './FileInput';
import ActionCarousel from './ActionCarousel';
import styles from './styles/MainView.module.css';

const MainView = () => {
    const [filePath, setFilePath] = useState('');
    const [selectionType, setSelectionType] = useState<'file' | 'folder' | null>(null);


    const handleSelection = (selection: { path: string; type: 'file' | 'folder' } | null) => {
        if (selection) {
            setFilePath(selection.path);
            setSelectionType(selection.type);
        } else {
            setFilePath('');
            setSelectionType(null);
        }
    };


    const handleNextClick = async () => {
        if (!filePath || !selectedAction) {
            console.error('File path or action not selected.');
            return;
        }

        console.log(`Sending command: ${selectedAction} for path: ${filePath}`);

        try {
            const response = await fetch('http://127.0.0.1:8000/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filePath: filePath,
                    command: selectedAction,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Response from backend:', result);

            // TODO: Here you can navigate to a new view to display the results

        } catch (error) {
            console.error('Failed to connect to the backend:', error);
            // TODO: Show an error message to the user in the UI
        }
    };

    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const isButtonDisabled = !filePath || !selectedAction;


    return (
        <div style={{ padding: '2rem' }}>
            <div className="w-full max-w-4xl mx-auto text-center">
                <h1 className={styles.title}>XML Genius</h1>
                <p className={styles.subtitle}>Select a file or folder to begin</p>

                <FileInput onSelection={handleSelection} />

                <ActionCarousel
                    selectedAction={selectedAction}
                    onActionSelect={setSelectedAction}
                    selectionType={selectionType}
                />

                <div className={styles.buttonContainer}>
                    <button
                        onClick={handleNextClick}
                        disabled={isButtonDisabled}
                        className={styles.nextButton}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainView;