import React from 'react';

/**
 * Reusable glassmorphic Card / Panel component.
 */
const Card = ({
  children,
  hoverable = false,
  glowActive = false,
  className = '',
  onClick,
  ...props
}) => {
  const cardClasses = [
    'glass-panel rounded-3xl p-5 border border-white/5',
    hoverable ? 'glass-card-hover' : '',
    glowActive ? 'glow-border-active' : '',
    onClick ? 'cursor-pointer' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
