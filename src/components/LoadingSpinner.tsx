import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", color = "blue-600", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-2 border-${color} border-opacity-75 ${sizeClasses[size]}`}
        style={{
          borderTopColor: "currentColor",
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          borderLeftColor: "transparent",
        }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
