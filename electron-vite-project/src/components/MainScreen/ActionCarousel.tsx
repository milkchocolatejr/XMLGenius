import React, { useState } from 'react';
import ActionButton from './ActionButton';
import styles from './styles/ActionCarousel.module.css';

const LeftArrow = () => <span>&#x2190;</span>;
const RightArrow = () => <span>&#x2192;</span>;

const actions = [
  { id: 'validate', title: 'Validate File/Folder', description: 'Check for well-formed XML and validate against a schema.' },
  { id: 'display', title: 'Display as Tree', description: 'Visualize the XML document as an interactive node tree.' },
  { id: 'add_node', title: 'Add Node', description: 'Insert a new node into the XML document.' },
  { id: 'remove_node', title: 'Remove Node', description: 'Delete a node from the XML document using its path.' },
];

const ACTIONS_TO_SHOW = 2;

interface ActionCarouselProps {
  selectedAction: string | null;
  onActionSelect: (actionId: string) => void;
  selectionType: 'file' | 'folder' | null;
}

const ActionCarousel: React.FC<ActionCarouselProps> = ({ selectedAction, selectionType, onActionSelect }) => {
  const [startIndex, setStartIndex] = useState(0);

  const goToPrevious = () => {
    setStartIndex(prevIndex => Math.max(0, prevIndex - 1));
  };

  const goToNext = () => {
    setStartIndex(prevIndex => Math.min(actions.length - ACTIONS_TO_SHOW, prevIndex + 1));
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Select an Action</h2>
      <div className={styles.carousel}>
        <button
          onClick={goToPrevious}
          disabled={startIndex === 0}
          className={styles.navButton}
        >
          <LeftArrow />
        </button>

        <div className={styles.track}>
          {actions.slice(startIndex, startIndex + ACTIONS_TO_SHOW).map((action) => (
            <ActionButton
              key={action.id}
              title={action.title}
              description={action.description}
              isSelected={selectedAction === action.id}
              onClick={() => onActionSelect(action.id)}
              isDisabled={!selectionType || (selectionType === 'folder' && action.id !== 'validate')}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          disabled={startIndex >= actions.length - ACTIONS_TO_SHOW}
          className={styles.navButton}
        >
          <RightArrow />
        </button>
      </div>
    </div>
  );
};

export default ActionCarousel;