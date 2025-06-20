import { useState } from 'react';
import FileInput from './FileInput';
import ActionCarousel from './ActionCarousel';
import styles from './styles/MainView.module.css';
import DisplayView from '../VizualizeScreen/DisplayView';
import ValidateView from '../ValidateScreen/ValidateView';
import EditorView from '../EditorScreen/EditorView';

const MainView = () => {
    const [filePath, setFilePath] = useState('');
    const [selectionType, setSelectionType] = useState<'file' | 'folder' | null>(null);
    const [showDisplayView, setShowDisplayView] = useState(false);
    const [showValidateView, setShowValidateView] = useState(false);
    const [parsedXmlData, setParsedXmlData] = useState<any>(null);
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [isValidXml, setIsValidXml] = useState<boolean | null>(null);
    const [validationMessage, setValidationMessage] = useState<string>('');
    const [isValidating, setIsValidating] = useState(false);
    const [folderValidationResults, setFolderValidationResults] = useState<any[]>([]);
    const [showEditorView, setShowEditorView] = useState(false);
    
    const isButtonDisabled = !filePath || !selectedAction;

    // Function to transform parsed XML data to react-d3-tree format
    const transformXmlToTreeData = (xmlData: any): any => {
        const transformNode = (key: string, value: any): any => {
            // Skip XML declaration
            if (key === '?xml') {
                return null;
            }

            const node: any = {
                name: key,
                attributes: {}
            };

            // If value is a primitive (string/number), it's a leaf node
            if (typeof value === 'string' || typeof value === 'number') {
                node.name = `${key}: ${value}`;
                return node;
            }

            // If value is an object, process its properties
            if (typeof value === 'object' && value !== null) {
                const children: any[] = [];
                
                // Process attributes (properties starting with @_)
                Object.keys(value).forEach(prop => {
                    if (prop.startsWith('@_')) {
                        const attrName = prop.substring(2); // Remove @_ prefix
                        node.attributes[attrName] = value[prop];
                        node.name = `${key} (${attrName}="${value[prop]}")`;
                    }
                });

                // Process child elements
                Object.keys(value).forEach(prop => {
                    if (!prop.startsWith('@_')) {
                        const childValue = value[prop];
                        
                        // Handle arrays (multiple elements with same name)
                        if (Array.isArray(childValue)) {
                            childValue.forEach((item, index) => {
                                const childNode = transformNode(`${prop}[${index}]`, item);
                                if (childNode) children.push(childNode);
                            });
                        } else {
                            const childNode = transformNode(prop, childValue);
                            if (childNode) children.push(childNode);
                        }
                    }
                });

                if (children.length > 0) {
                    node.children = children;
                }
            }

            return node;
        };

        // Find the root element (skip ?xml declaration)
        const rootKey = Object.keys(xmlData).find(key => key !== '?xml');
        if (rootKey) {
            return transformNode(rootKey, xmlData[rootKey]);
        }

        return { name: 'root', children: [] };
    };

    // Function to validate XML file automatically
    const validateXmlFile = async (xmlFilePath: string) => {
        if (!xmlFilePath.endsWith('.xml')) {
            setIsValidXml(true); // Non-XML files are considered "valid" for other operations
            setValidationMessage('');
            return;
        }

        setIsValidating(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filePath: xmlFilePath,
                    command: 'validate',
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Validation result:', result);
            
            // Backend returns { valid: boolean, message: string }
            setIsValidXml(result.valid);
            setValidationMessage(result.message || '');
            
        } catch (error) {
            console.error('Failed to validate XML:', error);
            setIsValidXml(false);
            setValidationMessage('Failed to connect to validation server');
        } finally {
            setIsValidating(false);
        }
    };

    // Function to validate folder (all XML files in folder)
    const validateFolder = async (folderPath: string) => {
        setIsValidating(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filePath: folderPath,
                    command: 'validate',
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Folder validation result:', result);
            
            // Assuming backend returns array of { fileName: string, valid: boolean, message?: string }
            setFolderValidationResults(result.files || []);
            
            // Set overall folder status based on all files
            const allValid = result.files && result.files.every((file: any) => file.valid);
            setIsValidXml(allValid);
            
        } catch (error) {
            console.error('Failed to validate folder:', error);
            setIsValidXml(false);
            setValidationMessage('Failed to connect to validation server');
        } finally {
            setIsValidating(false);
        }
    };


    const handleSelection = (selection: { path: string; type: 'file' | 'folder' } | null) => {
        if (selection) {
            setFilePath(selection.path);
            setSelectionType(selection.type);
            
            // Reset validation state
            setIsValidXml(null);
            setValidationMessage('');
            setFolderValidationResults([]);
            
            // Auto-validate based on selection type
            if (selection.type === 'file' && selection.path.endsWith('.xml')) {
                validateXmlFile(selection.path);
            } else if (selection.type === 'file') {
                // For non-XML files, set as valid
                setIsValidXml(true);
            } else if (selection.type === 'folder') {
                // For folders, validate all XML files in the folder
                validateFolder(selection.path);
            }
        } else {
            setFilePath('');
            setSelectionType(null);
            setIsValidXml(null);
            setValidationMessage('');
            setFolderValidationResults([]);
        }
    };


    const handleNextClick = async () => {
        if (!filePath || !selectedAction) {
            console.error('File path or action not selected.');
            return;
        }

        console.log(`Sending command: ${selectedAction} for path: ${filePath}`);

        if (selectedAction === 'validate') {
            // Always allow navigation to ValidateView regardless of validity
            setShowValidateView(true);
            return;
        }
        
        // For non-validate actions, check if XML file is valid
        if (selectionType === 'file' && filePath.endsWith('.xml') && isValidXml === false) {
            alert('Cannot proceed: The selected XML file is invalid. Please fix the XML errors first or use the Validate action to see details.');
            return;
        }
        
        // Additional check for folders with invalid XML files
        if (selectionType === 'folder' && isValidXml === false) {
            alert('Cannot proceed: The selected folder contains invalid XML files. Please fix the XML errors first or use the Validate action to see details.');
            return;
        }
        
        if (selectedAction === 'display') {
            console.log(`Displaying XML for path: ${filePath}`);
            
            // Check if it's an XML file and validate it first
            if (filePath.endsWith('.xml') && isValidXml === false) {
                alert('Cannot display: The selected XML file is invalid. Please fix the XML errors first or use the Validate action to see details.');
                return;
            }
            
            try {
                const result = await window.api.parseXML(filePath);
                console.log('Parsed XML result:', result);

                if (result.status === 'success') {
                    // Transform the parsed XML data to tree format
                    const treeData = transformXmlToTreeData(result.data);
                    console.log('Transformed tree data:', treeData);
                    setParsedXmlData(treeData);
                    setShowDisplayView(true);
                } else {
                    console.error('Failed to parse XML:', result.message);
                    alert(`Failed to parse XML: ${result.message}`);
                    return;
                }
            } catch (error) {
                console.error('Error parsing XML:', error);
                alert(`Error parsing XML: ${error}`);
            }
        }

        if(selectedAction === 'add_and_remove_node'){
            console.log(`Editing XML for path: ${filePath}`);
            
            // Check if it's an XML file and validate it first
            if (filePath.endsWith('.xml') && isValidXml === false) {
                alert('Cannot edit: The selected XML file is invalid. Please fix the XML errors first or use the Validate action to see details.');
                return;
            }
            
            setShowDisplayView(false);
            setParsedXmlData(null);
            setShowValidateView(false);
            setShowEditorView(true);
            return;
        }

        if(selectedAction === 'find_node'){
            alert('Find Node functionality is coming soon!');
            return;
        }
    };

    if(showEditorView) {
        return (
            <EditorView
                filePath={filePath}
                onGoBack={() => {
                    setShowEditorView(false);
                    setFilePath('');
                    setSelectionType(null);
                    setParsedXmlData(null);
                }}
            />
        );
    }
    // If we should show the validate view, render the ValidateView
    if (showValidateView) {
        return (
            <ValidateView
                path={filePath}
                selectionType={selectionType!}
                validationData={{
                    isValid: isValidXml,
                    validationMessage: validationMessage,
                    folderResults: folderValidationResults,
                    isValidating: isValidating
                }}
                onGoBack={() => setShowValidateView(false)}
            />
        );
    }

    // If we should show the display view, render the DisplayView
    if (showDisplayView && parsedXmlData) {
        return (
            <DisplayView
                data={parsedXmlData}
                onGoBack={() => {
                    setShowDisplayView(false);
                    setParsedXmlData(null);
                }}
            />
        );
    }

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