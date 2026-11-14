import ListHeader from "../../shared/ListHeader";
import { useModalParams } from "../../shared/useModalParams";

interface Props {
  setSearchCallback: (param: string) => void;
}

export default function TableHeader({ setSearchCallback }: Props) {
  const { openCreate } = useModalParams();
  return <ListHeader onSearch={setSearchCallback} placeholder="Cari add-on..." createLabel="Tambah add-on" onCreate={openCreate} />;
}
