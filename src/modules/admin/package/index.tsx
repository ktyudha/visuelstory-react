import PageCard from "../shared/PageCard";
import Table from "./Table";
import PackageFormModal from "./Action/FormModal";

export default function AdminPackage() {
  return (
    <PageCard>
      <Table />
      <PackageFormModal />
    </PageCard>
  );
}
