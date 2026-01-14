import React from 'react';

export const SkeletonLine: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <span aria-hidden className={`inline-block bg-gray-300 dark:bg-gray-700 rounded animate-pulse ${className}`} />
  );
};

export default SkeletonLine;
