import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useCreate from "@services/admin/package-addon/hooks/useCreate";
import useUpdate from "@services/admin/package-addon/hooks/useUpdate";
import type { ICreatePayload } from "@services/admin/package-addon/interfaces/create.type";
import FormModal from "../../shared/FormModal";
import { Field, inputCls } from "../../shared/ui";
import { useAdminItem } from "../../shared/useAdminItem";
import { useModalParams } from "../../shared/useModalParams";

interface AddOn { id: string; name: string; price: number | string }
const empty: ICreatePayload = { name: "", price: "" };

export default function PackageAddOnFormModal() {
  const { open, editId, close } = useModalParams();
  const { item, loading } = useAdminItem<AddOn>("/admin/package-addons", editId);
  const { createData } = useCreate();
  const { updateData } = useUpdate(editId ?? "");

  const { register, handleSubmit, reset, formState: { isValid, isSubmitting } } = useForm<ICreatePayload>({ mode: "onChange", defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    reset(editId ? { name: item?.name ?? "", price: String(item?.price ?? "") } : empty);
  }, [open, editId, item, reset]);

  const onSubmit = handleSubmit(async (state) => {
    const { error } = editId ? await updateData(state) : await createData(state);
    if (error) return void toast.error(error === "Server error" ? "Gagal menyimpan data." : error);
    toast.success(editId ? "Add-on diperbarui." : "Add-on ditambahkan.");
    close();
  });

  return (
    <FormModal open={open} title={editId ? "Ubah add-on" : "Tambah add-on"} onClose={close} onSubmit={onSubmit}
      submitting={isSubmitting} valid={isValid && !loading}>
      <Field label="Nama add-on"><input {...register("name", { required: true })} autoFocus className={inputCls} placeholder="Mis. Album cetak 20 halaman" /></Field>
      <Field label="Harga (Rp)"><input type="number" min={0} {...register("price", { required: true, min: 0 })} className={inputCls} placeholder="0" /></Field>
    </FormModal>
  );
}
