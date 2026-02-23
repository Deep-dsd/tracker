import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  const clickableStyles = onClick ? 'cursor-pointer hover:bg-gray-50' : '';
  
  return (
    <div
      className={`bg-white border border-gray-100 rounded-xl shadow-sm p-6 ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
