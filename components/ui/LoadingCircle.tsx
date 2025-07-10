import React from 'react';

type LoadingCircleProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
};

const LoadingCircle: React.FC<LoadingCircleProps> = ({ 
  size = 'md',
  color = 'border-blue-600'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} ${color} rounded-full border-t-transparent animate-spin`}
      />
    </div>
  );
};

export default LoadingCircle;
