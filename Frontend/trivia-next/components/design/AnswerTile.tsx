import React from 'react';
interface AnswerTileProps {
  text: string;
  selected?: boolean;
  correct?: boolean | null;
  onClick: () => void;
  disabled?: boolean;
}
const AnswerTile = ({
  text,
  selected = false,
  correct = null,
  onClick,
  disabled = false
}: AnswerTileProps) => {
  let statusClasses = 'border-2 border-transparent';
  if (correct === true) {
    statusClasses = 'border-2 border-green-400 bg-green-800/50';
  } else if (correct === false) {
    statusClasses = 'border-2 border-red-400 bg-red-800/50';
  } else if (selected) {
    statusClasses = 'border-2 border-purple-400 bg-indigo-700/80';
  }
  return <div onClick={disabled ? undefined : onClick} className={`
        relative bg-indigo-800/60 backdrop-blur-sm rounded-xl p-4 shadow-lg
        transition-all duration-200 text-center font-medium
        ${!disabled ? 'cursor-pointer hover:bg-indigo-700/80 hover:transform hover:scale-105' : 'opacity-80'}
        ${statusClasses}
      `}>
      {text}
    </div>;
};
export default AnswerTile;