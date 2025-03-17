
import React, { ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  animationDelay?: number;
  onClick?: () => void;
}

const AnimatedCard = ({ 
  children, 
  className, 
  animationDelay = 0,
  onClick
}: AnimatedCardProps) => {
  return (
    <div
      className={cn(
        "glass-card rounded-lg p-4 animate-scale-in opacity-0", 
        className
      )}
      style={{ 
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'forwards' 
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
