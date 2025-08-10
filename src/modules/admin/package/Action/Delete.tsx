import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

import { toast } from "react-toastify";
import useDelete from "@services/admin/package/hooks/useDelete";

interface Props {
  id: string;
  name: string;
  onOpen: boolean;
  onClose: () => void;
}

export default function Delete({ id, name, onOpen, onClose }: Props) {
  const { deleteData } = useDelete();

  const onDelete = async () => {
    const { error, response } = await deleteData(id);
    if (error || response) {
      if (error) {
        toast.error("Failed to delete data!", {
          position: "top-center",
        });
      } else {
        toast.success("Data deleted successfully.", {
          position: "top-center",
        });
        onClose();
      }
    }
  };
  return (
    <>
      {/* <Button onClick={onClose}>Toggle modal</Button> */}
      <Modal show={onOpen} size="md" onClose={onClose} popup>
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete
              <br />
              <span className="font-bold capitalize">{name}</span>?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color={"failure"}
                onClick={onDelete}
                className="cursor-pointer hover:bg-red-500 hover:text-white"
              >
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={onClose} className="cursor-pointer">
                No, cancel
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
