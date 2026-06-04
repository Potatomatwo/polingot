"use client"

import * as React from "react"

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress = ({ value, className }: ProgressProps) => {
  // Ensure value is between 0 and 100
  const safeValue = Math.min(Math.max(value || 0, 0), 100);
  
  
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ${className || ""}`}>
      <div
        className="h-full bg-green-500 transition-all duration-300 ease-in-out"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
};

export default Progress;
