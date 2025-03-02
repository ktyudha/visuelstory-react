import { storage } from "@constants/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadImageToStorage = async (
  nameDB: string,
  file: File,
  id: string
) => {
  const storageRef = ref(storage, `${nameDB}/${id}/${file.name}`);

  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
