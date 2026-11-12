import React from 'react';

const Spinner: React.FC<{ label?: string }> = ({ label }) => (
  <div className="text-center" role="status">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
    {label && <p className="text-gray-600 dark:text-gray-400">{label}</p>}
  </div>
);

export default Spinner;
