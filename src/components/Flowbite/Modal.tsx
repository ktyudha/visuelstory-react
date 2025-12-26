import Button from "@components/Button";
import { useOutsideClick } from "@hooks/useOutsideClick";
import { Modal, ModalBody } from "flowbite-react";
import { ReactNode } from "react";
import { HiX } from "react-icons/hi";

interface Props {
  title?: string;
  size?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl";
  onOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function ModalComponent({
  onOpen,
  onClose,
  title,
  size = "md",
  children,
}: Props) {
  const modalRef = useOutsideClick(() => {
    if (onOpen) {
      onClose();
    }
  });

  return (
    <Modal
      ref={modalRef}
      show={onOpen}
      size={size}
      onClose={onClose}
      popup
      position="center"
      className="[&>div]:h-auto"
    >
      {/* {title && (
        <ModalHeader className="flex items-center px-4 pt-2">
          <p className="text-sm my-auto">{title}</p>
        </ModalHeader>
      )} */}

      <div className="flex justify-between items-start px-4 py-4">
        <div className="my-auto">
          <p className="text-md font-bold">{title}</p>
        </div>

        <Button
          type="button"
          onClick={onClose}
          className="group flex items-center cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:bg-gradient-to-l focus:ring-purple-200 dark:focus:ring-purple-800 rounded-lg"
        >
          <HiX size={20} />
        </Button>
      </div>

      <ModalBody>{children}</ModalBody>
    </Modal>
  );
}
