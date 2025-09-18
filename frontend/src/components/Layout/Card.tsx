import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-xl p-6">
      {children}
    </div>
  );
};

export default Card;
