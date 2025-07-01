import React from "react";

interface ProgressProps {
  value?: number;
  className?: string;
}

export function Progress({ value = 0, className = "" }: ProgressProps) {
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
} 