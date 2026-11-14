import PageCard from "../shared/PageCard";
import Table from "./Table";
import CustomerFormModal from "./Action/FormModal";

export default function AdminCustomer() {
  return (
    <PageCard>
      <Table />
      <CustomerFormModal />
    </PageCard>
  );
}
