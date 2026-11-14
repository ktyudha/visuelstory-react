import RowActions from "../../shared/RowActions";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModalParams } from "../../shared/useModalParams";

import EventDelete from "../Action/Delete";
interface Props {
  id: string;
  name: string;
}

export default function TableItemMenu({ id, name }: Props) {
  const navigate = useNavigate();
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
        onView={() => navigate(`show/${id}`)}
        onEdit={() => openEdit(id)}
        onDelete={() => setOpenDeleteModal(true)}
      />
    </>
  );
}
