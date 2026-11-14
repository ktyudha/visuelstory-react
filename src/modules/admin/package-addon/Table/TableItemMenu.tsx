import RowActions from "../../shared/RowActions";
import { useState } from "react";
import { useModalParams } from "../../shared/useModalParams";

import EventDelete from "../Action/Delete";
interface Props {
  id: string;
  name: string;
}

export default function TableItemMenu({ id, name }: Props) {
  const { openEdit } = useModalParams();
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

  return (
    <>
      <EventDelete
        id={id}
        name={name}
        onOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
      />
      <RowActions
        onEdit={() => openEdit(id)}
        onDelete={() => setOpenDeleteModal(true)}
      />
    </>
  );
}
