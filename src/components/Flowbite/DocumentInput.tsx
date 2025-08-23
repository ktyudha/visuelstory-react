import { FunctionComponent, useEffect, useState } from "react";
import { FileState } from "@/hooks/useFileUpload";
import { HiFolderAdd, HiOutlineTrash } from "react-icons/hi";
import { Label } from "flowbite-react";

interface Props {
  label?: string;
  file: FileState | null;
  getRootProps: any;
  getInputProps: any;
  onRemove: VoidFunction;
  image?: string;
  readOnly?: boolean;
  isRequired?: boolean;
}

const DocumentInput: FunctionComponent<Props> = ({
  label,
  file,
  getInputProps,
  getRootProps,
  onRemove,
  image,
  isRequired,
  readOnly = false,
}) => {
  const [imageState, setimageState] = useState(image);

  useEffect(() => {
    if (image) {
      setimageState(image);
    }
  }, [image, imageState]);

  const onHandleGetRootProps = () => {
    if (!readOnly) {
      return { ...getRootProps() };
    }

    return false;
  };

  const onRemoveImage = () => {
    setimageState("");
    onRemove();
  };

  return (
    <>
      <div className="flex items-start gap-3 rounded-md flex-col">
        {label && (
          <Label htmlFor={label} className="text-start items-start">
            {label} {isRequired && <span className="text-red-500">*</span>}
          </Label>
        )}

        <div
          className="flex items-center dark:bg-gray-700 gap-2 border-1 px-8 py-14 rounded-md cursor-pointer"
          {...onHandleGetRootProps()}
        >
          <HiFolderAdd size={20} />
          <span className="font-medium text-sm">
            {file?.name || "Pilih Dokumen"}
          </span>
          <input {...getInputProps()} />
        </div>

        <button
          type="button"
          className="hover:bg-red-500 font-medium py-2 px-6 rounded-md border text-sm flex gap-2.5 border-red-500 text-red-500 hover:text-white"
          onClick={() => !readOnly && onRemoveImage()}
        >
          <HiOutlineTrash size={20} />
          Hapus Dokumen
        </button>
      </div>
    </>
  );
};

export default DocumentInput;
