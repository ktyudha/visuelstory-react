import { useCallback, useEffect, useState } from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";

export interface FileState {
  preview: string;
  file: any;
  name: string;
}

export default function useFileUpload(param?: DropzoneOptions) {
  const [file, setFile] = useState<FileState | null>(null);
  const [error, setError] = useState("");

  useEffect(
    () => () => URL.revokeObjectURL(file?.preview as string),
    [file?.preview]
  );

  const onRemove = useCallback(() => {
    setFile(null);
    URL.revokeObjectURL(file?.preview as string);
  }, [file?.preview]);

  const { getInputProps, getRootProps, ...dropzoneVars } = useDropzone({
    maxFiles: 1,
    onDrop: (acceptedFile: any) => {
      setFile({
        preview: URL.createObjectURL(acceptedFile[0]),
        file: acceptedFile[0],
        name: acceptedFile[0].name,
      });
    },
    onError: (err) => setError(err.message),
    ...param,
  });

  return {
    getInputProps,
    getRootProps,
    file,
    error,
    onRemove,
    dropzoneVars,
  };
}
