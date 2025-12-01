import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className }) => {
  const baseClasses = "inline-block px-2 py-1 text-sm font-medium rounded-full";
  
  const variantClasses = (() => {
    switch (variant) {
      case "secondary":
        return "bg-gray-200 text-gray-800";
      case "destructive":
        return "bg-red-500 text-white";
      case "outline":
        return "border border-gray-400 text-gray-800";
      default:
        return "bg-blue-500 text-white"; // default
    }
  })();

  return <span className={`${baseClasses} ${variantClasses} ${className || ""}`}>{children}</span>;
};
