import { useCallback } from "react";
import { TextInput } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import debounce from "lodash/debounce";

interface Props {
  setSearchCallback: (param: string) => void;
}

export default function TableHeader({ setSearchCallback }: Props) {
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchCallback(value);
    }, 500),
    [] // make sure debounce isn't recreated on every render
  );

  return (
    <>
      <div className="flex lg:flex-row flex-col justify-between gap-4 mb-4">
        <div className="flex gap-4 lg:flex-row flex-col">
          {/* Search */}
          <TextInput
            id="search-packages"
            type="text"
            icon={HiSearch}
            placeholder="Search"
            className="lg:w-80 w-auto"
            onChange={(e) => debouncedSearch(e.target.value)}
            required
          />
        </div>
      </div>
    </>
  );
}
