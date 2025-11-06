import React from 'react';
import SpotlightCard from './SpotlightCard';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  spotlightColor?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false, 
  onClick,
  spotlightColor = 'rgba(251, 191, 36, 0.15)' // amber color with transparency
}) => {
  const baseClasses = `bg-white rounded-xl shadow-md ${hover ? 'hover:shadow-xl transition-shadow duration-200' : ''} ${className}`;
  
  return (
    <SpotlightCard 
      className={baseClasses}
      spotlightColor={spotlightColor}
      onClick={onClick}
    >
      {children}
    </SpotlightCard>
  );
};

