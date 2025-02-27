import { Timestamp } from "firebase/firestore";

export interface ICreateUpdateAboutPayload {
  title: string;
  description: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
