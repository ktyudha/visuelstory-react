import PageCard from "../shared/PageCard";
import TablePackageCategory from "./Table";
import PackageCategoryFormModal from "./Action/FormModal";
export default function AdminPackageAddOn() {
  return (
    <PageCard>
      <TablePackageCategory />
      <PackageCategoryFormModal />
    </PageCard>
  );
}
