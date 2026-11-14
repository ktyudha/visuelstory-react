import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useCreate from "@services/admin/customer/hooks/useCreate";
import useUpdate from "@services/admin/customer/hooks/useUpdate";
import type { Customer } from "@services/admin/customer/interfaces/get-all.type";
import type { ICreatePayload } from "@services/admin/customer/interfaces/create.type";
import FormModal from "../../shared/FormModal";
import { Field, inputCls } from "../../shared/ui";
import { useAdminItem } from "../../shared/useAdminItem";
import { useModalParams } from "../../shared/useModalParams";

const empty: ICreatePayload = { name: "", whatsapp: "", email: "", address: "" };

export default function CustomerFormModal() {
  const { open, editId, close } = useModalParams();
  const { item, loading } = useAdminItem<Customer>("/admin/customers", editId);
  const { createData } = useCreate();
  const { updateData } = useUpdate(editId ?? "");

  const { register, handleSubmit, reset, formState: { isValid, isSubmitting } } = useForm<ICreatePayload>({ mode: "onChange", defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    reset(editId ? { name: item?.name ?? "", whatsapp: item?.whatsapp ?? "", email: item?.email ?? "", address: item?.address ?? "" } : empty);
  }, [open, editId, item, reset]);

  const onSubmit = handleSubmit(async (state) => {
    const { error } = editId ? await updateData(state) : await createData(state);
    if (error) return void toast.error(error === "Server error" ? "Gagal menyimpan data." : error);
    toast.success(editId ? "Customer diperbarui." : "Customer ditambahkan.");
    close();
  });

  return (
    <FormModal open={open} title={editId ? "Ubah customer" : "Tambah customer"} onClose={close} onSubmit={onSubmit}
      submitting={isSubmitting} valid={isValid && !loading}>
      <Field label="Nama lengkap"><input {...register("name", { required: true })} autoFocus className={inputCls} placeholder="Nama customer" /></Field>
      <Field label="Nomor WhatsApp" hint="Format 62812xxxx. Dipakai customer untuk login OTP.">
        <input {...register("whatsapp", { required: true, pattern: /^[0-9+\s-]{9,20}$/ })} inputMode="tel" className={inputCls} placeholder="62812xxxxxxx" />
      </Field>
      <Field label="Email (opsional)"><input type="email" {...register("email")} className={inputCls} /></Field>
      <Field label="Alamat (opsional)"><textarea rows={2} {...register("address")} className={inputCls} /></Field>
    </FormModal>
  );
}
