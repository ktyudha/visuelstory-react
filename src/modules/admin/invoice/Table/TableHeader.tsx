import { useCallback } from "react";
import { TextInput } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
// import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";

interface Props {
  setSearchCallback: (param: string) => void;
}

export default function TableHeader({ setSearchCallback }: Props) {
  // const navigate = useNavigate();
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchCallback(value);
    }, 500),
    [] // make sure debounce isn't recreated on every render
  );

  return (
    <>
      <div className="flex lg:flex-row flex-col justify-between gap-4 mb-4">
        {/* <Button
          className="cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:bg-gradient-to-bl focus:ring-cyan-300 dark:focus:ring-cyan-800"
          onClick={() => navigate("create")}
        >
          <HiPlus className="mr-2 h-5 w-5" />
          Create
        </Button> */}
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
