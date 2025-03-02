import React from "react";
import "./Skeleton.css";

interface SkeletonProps {
  isLoading: boolean;
  children: React.ReactNode;
  height?: string;
  width?: string;
  borderRadius?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  isLoading,
  children,
  height = "1rem",
  width = "100%",
  borderRadius = "4px",
}) => {
  if (isLoading) {
    return (
      <div
        className="skeleton"
        style={{ minHeight: height, width, borderRadius }}
      ></div>
    );
  }

  return <>{children}</>;
};

export default Skeleton;
