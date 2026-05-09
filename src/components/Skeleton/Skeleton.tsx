import React from "react";
import clsx from "clsx";
import "./Skeleton.css";

interface SkeletonProps {
  isLoading: boolean;
  children?: React.ReactNode;
  height?: string;
  width?: string;
  borderRadius?: string;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  isLoading,
  children,
  height = "1rem",
  width = "100%",
  borderRadius = "4px",
  className
}) => {
  if (isLoading) {
    return (
      <div
        className={clsx("skeleton", className)}
        style={{ minHeight: height, width, borderRadius }}
      ></div>
    );
  }

  return <>{children}</>;
};

export default Skeleton;
