import { Button } from "flowbite-react";
import { HiOutlineEye, HiPencil, HiTrash } from "react-icons/hi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Delete from "../Action/Delete";
interface Props {
  id: string;
  invoice_number: string;
}

export default function TableItemMenu({ id, invoice_number }: Props) {
  const navigate = useNavigate();
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

  return (
    <>
      <Delete
        id={id}
        invoice_number={invoice_number}
        onOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => navigate(`show/${id}`)}
          className="cursor-pointer px-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
        >
          <HiOutlineEye />
        </Button>
        <Button
          onClick={() => navigate(`edit/${id}`)}
          className="cursor-pointer px-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
        >
          <HiPencil />
        </Button>
        <Button
          onClick={() => setOpenDeleteModal(true)}
          className="cursor-pointer px-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
        >
          <HiTrash />
        </Button>
      </div>
    </>
  );
}
