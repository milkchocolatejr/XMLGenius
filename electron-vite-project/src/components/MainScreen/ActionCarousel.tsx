import React, { useState } from 'react';
import ActionButton from './ActionButton';
import styles from './styles/ActionCarousel.module.css';

const LeftArrow = () => <span>&#x2190;</span>;
const RightArrow = () => <span>&#x2192;</span>;

const actions = [
  { id: 'validate', title: 'Validate File/Folder', description: 'Check for well-formed XML and validate against a schema. Works with non self-closing tags' },
  { id: 'display', title: 'Display as Tree', description: 'Visualize the XML document as an interactive node tree.' },
  { id: 'find_node', title: 'Find a Node', description: 'Finds a node given a tag or path' },
  { id: 'add_and_remove_node', title: 'Add & Remove Node', description: 'Opens up a text editor to manipulate a xml document quickly' },
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