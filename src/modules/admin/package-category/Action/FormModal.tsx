import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useCreatePackageCategory from "@services/admin/package-category/hooks/useCreatePackageCategory";
import useUpdatePackageCategory from "@services/admin/package-category/hooks/useUpdatePackageCategory";
import type { ICreatePackageCategoryPayload } from "@services/admin/package-category/interfaces/create-package-category.type";
import type { PackageCategory } from "@services/admin/package-category/interfaces/get-all-package-category.type";
import FormModal from "../../shared/FormModal";
import { Field, inputCls } from "../../shared/ui";
import { useAdminItem } from "../../shared/useAdminItem";
import { useModalParams } from "../../shared/useModalParams";

const empty: ICreatePackageCategoryPayload = { name: "", description: "" };

export default function PackageCategoryFormModal() {
  const { open, editId, close } = useModalParams();
  const { item, loading } = useAdminItem<PackageCategory>("/admin/package-categories", editId);
  const { createPackageCategory } = useCreatePackageCategory();
  const { updatePackageCategory } = useUpdatePackageCategory(editId ?? "");

  const { register, handleSubmit, reset, formState: { isValid, isSubmitting } } = useForm<ICreatePackageCategoryPayload>({ mode: "onChange", defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    reset(editId ? { name: item?.name ?? "", description: item?.description ?? "" } : empty);
  }, [open, editId, item, reset]);

  const onSubmit = handleSubmit(async (state) => {
    const { error } = editId ? await updatePackageCategory(state) : await createPackageCategory(state);
    if (error) return void toast.error(error === "Server error" ? "Gagal menyimpan data." : error);
    toast.success(editId ? "Kategori diperbarui." : "Kategori ditambahkan.");
    close();
  });

  return (
    <FormModal open={open} title={editId ? "Ubah kategori" : "Tambah kategori"} onClose={close} onSubmit={onSubmit}
      submitting={isSubmitting} valid={isValid && !loading}>
      <Field label="Nama kategori"><input {...register("name", { required: true })} autoFocus className={inputCls} placeholder="Mis. Wedding" /></Field>
      <Field label="Deskripsi"><textarea rows={3} {...register("description", { required: true })} className={inputCls} placeholder="Penjelasan singkat kategori" /></Field>
    </FormModal>
  );
}
