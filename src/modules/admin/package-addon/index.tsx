import PageCard from "../shared/PageCard";
import TablePackageAddOn from "./Table";
import PackageAddOnFormModal from "./Action/FormModal";

export default function AdminPackageCategory() {
  return (
    <PageCard>
      <TablePackageAddOn />
      <PackageAddOnFormModal />
    </PageCard>
  );
}
