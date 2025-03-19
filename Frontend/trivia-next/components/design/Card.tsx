import React from 'react';
interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}
const Card = ({
  children,
  onClick,
  selected = false,
  className = ''
}: CardProps) => {
  return <div onClick={onClick} className={`
        bg-indigo-800/60 backdrop-blur-sm rounded-xl p-5 shadow-lg 
        border-2 transition-all duration-200 cursor-pointer
        ${selected ? 'border-purple-400 bg-indigo-700/80' : 'border-transparent hover:border-purple-400/50'}
        ${onClick ? 'hover:transform hover:scale-105' : ''}
        ${className}
      `}>
      {children}
    </div>;
};
export default Card;