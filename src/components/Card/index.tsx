import { FunctionComponent, ReactNode } from "react";
import clsx from "clsx";

interface Props {
  children: ReactNode;
  className?: string;
}

const Card: FunctionComponent<Props> = ({ children, className }) => {
  return (
    <div
      className={clsx([
        "px-[16px] py-[18px] rounded-[12px] border border-neutral-300 bg-base-200",
        className,
      ])}
    >
      {children}
    </div>
  );
};

export default Card;
