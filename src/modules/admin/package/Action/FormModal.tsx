import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useCreate from "@services/admin/package/hooks/useCreate";
import useUpdate from "@services/admin/package/hooks/useUpdate";
import useGetAllCategory from "@services/admin/package-category/hooks/useGetAllPackageCategory";
import type { ICreatePayload } from "@services/admin/package/interfaces/create.type";
import type { Package } from "@services/admin/package/interfaces/get-all.type";
import { formattedCurrency } from "@helpers/currency";
import FormModal from "../../shared/FormModal";
import { Field, inputCls } from "../../shared/ui";
import { useAdminItem } from "../../shared/useAdminItem";
import { useModalParams } from "../../shared/useModalParams";

const empty: ICreatePayload = { package_category_id: "", name: "", description: "", price: "", discount: 0 };

export default function PackageFormModal() {
  const { open, editId, close } = useModalParams();
  const { item, loading } = useAdminItem<Package>("/admin/packages", editId);
  const { data: categories } = useGetAllCategory();
  const { createData } = useCreate();
  const { updateData } = useUpdate(editId ?? "");

  const { register, handleSubmit, reset, watch, formState: { isValid, isSubmitting } } = useForm<ICreatePayload>({ mode: "onChange", defaultValues: empty });

  useEffect(() => {
    if (!open) return;
    reset(editId && item
      ? { package_category_id: item.package_category?.id ?? "", name: item.name, description: item.description ?? "", price: String(item.price), discount: item.discount ?? 0 }
      : empty);
  }, [open, editId, item, reset, categories]);

  const price = Number(watch("price")) || 0;
  const discount = Math.min(100, Math.max(0, Number(watch("discount")) || 0));

  const onSubmit = handleSubmit(async (state) => {
    const { error } = editId ? await updateData(state) : await createData(state);
    if (error) return void toast.error(error === "Server error" ? "Gagal menyimpan data." : error);
    toast.success(editId ? "Paket diperbarui." : "Paket ditambahkan.");
    close();
  });

  return (
    <FormModal open={open} size="lg" title={editId ? "Ubah paket" : "Tambah paket"} onClose={close} onSubmit={onSubmit}
      submitting={isSubmitting} valid={isValid && !loading}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama paket"><input {...register("name", { required: true })} autoFocus className={inputCls} placeholder="Mis. Paket Gold" /></Field>
        <Field label="Kategori">
          <select {...register("package_category_id", { required: true })} className={inputCls}>
            <option value="">Pilih kategori...</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Harga (Rp)"><input type="number" min={0} {...register("price", { required: true, min: 0 })} className={inputCls} placeholder="0" /></Field>
        <Field label="Diskon (%)" hint={price > 0 && discount > 0 ? `Harga akhir ${formattedCurrency(Math.round(price * (1 - discount / 100)))}` : undefined}>
          <input type="number" min={0} max={100} {...register("discount", { min: 0, max: 100 })} className={inputCls} />
        </Field>
      </div>
      <Field label="Deskripsi" hint="Satu baris per poin: durasi, jumlah foto, hasil, dll.">
        <textarea rows={5} {...register("description", { required: true })} className={inputCls} />
      </Field>
    </FormModal>
  );
}
