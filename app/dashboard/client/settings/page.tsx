'use client';
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`bg-white shadow-md rounded-lg ${className || ""}`}>{children}</div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={`px-4 py-2 border-b ${className || ""}`}>{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className }) => (
  <h2 className={`text-xl font-bold ${className || ""}`}>{children}</h2>
);

export const CardDescription: React.FC<CardProps> = ({ children, className }) => (
  <p className={`text-sm text-gray-500 ${className || ""}`}>{children}</p>
);

export const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={`p-4 ${className || ""}`}>{children}</div>
);

export const CardFooter: React.FC<CardProps> = ({ children, className }) => (
  <div className={`px-4 py-2 border-t ${className || ""}`}>{children}</div>
);
