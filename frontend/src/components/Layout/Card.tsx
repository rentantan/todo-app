import React, { ReactNode } from 'react';

const Card: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

export default Card;
