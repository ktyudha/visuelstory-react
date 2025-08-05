import { useMemo } from "react";

export default function useMapInputOptions(
  arrayFromFething: any[] | undefined
) {
  return useMemo(() => {
    if (arrayFromFething) {
      return arrayFromFething.map((each) => ({
        label: each.title ?? each.name,
        value: each.id,
      }));
    }
    return [{ label: "Data tidak ditemukan", value: "" }];
  }, [arrayFromFething]);
}
