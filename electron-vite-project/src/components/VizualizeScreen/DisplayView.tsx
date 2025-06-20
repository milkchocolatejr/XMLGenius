import React from 'react';
import Tree from 'react-d3-tree';
import styles from './DisplayView.module.css';

interface DisplayViewProps {
    data: any;
    onGoBack: () => void;
}

const DisplayView: React.FC<DisplayViewProps> = ({ data, onGoBack }) => {
    const nodeSize = { x: 200, y: 100 };
    const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: -100, y: 20 };
    
    const renderCustomNodeElement = ({ nodeDatum }: any) => (
        <g>
            <circle 
                r={10} 
                fill="#1f2937"       
                stroke="#0ea5e9"   
                strokeWidth={2}
            />
            <foreignObject {...foreignObjectProps}>
                <div
                    style={{
                        padding: '8px',
                        backgroundColor: '#374151',      
                        border: '1px solid #4b5563',    
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#d1d5db',                
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        wordWrap: 'break-word',
                    }}
                >
                    {nodeDatum.name || JSON.stringify(nodeDatum.attributes)}
                </div>
            </foreignObject>
        </g>
    );

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h1 className={styles.title}>XML Tree Visualization</h1>
                <button onClick={onGoBack} className={styles.goBackButton}>
                    ← Go Back
                </button>
            </div>
            <div className={styles.treeContainer}>
                <Tree
                    data={data}
                    orientation="vertical"
                    pathFunc="step"
                    collapsible
                    zoomable
                    translate={{ x: 400, y: 80 }}
                    nodeSize={nodeSize}
                    separation={{ siblings: 1.5, nonSiblings: 2 }}
                    renderCustomNodeElement={renderCustomNodeElement}
                />
            </div>
        </div>
    );
};

export default DisplayView;