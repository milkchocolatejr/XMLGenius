import React from 'react';
import Tree from 'react-d3-tree';
import styles from './DisplayView.module.css';

interface DisplayViewProps {
    data: any; // The parsed JSON data from the XML
    onGoBack: () => void;
}

const DisplayView: React.FC<DisplayViewProps> = ({ data, onGoBack }) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h1 className={styles.title}>XML Tree Visualization</h1>
                <button onClick={onGoBack} className={styles.goBackButton}>
                    Go Back
                </button>
            </div>
            <div className={styles.treeContainer}>
                <Tree
                    data={data}
                    orientation="vertical"
                    pathFunc="step"
                    collapsible
                    zoomable
                    translate={{ x: 200, y: 50 }} // Initial position of the tree
                    nodeSize={{ x: 140, y: 140 }}
                    separation={{ siblings: 1.5, nonSiblings: 2 }}
                />
            </div>
        </div>
    );
};

export default DisplayView;