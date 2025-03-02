import { Timestamp } from "firebase/firestore";

export interface ICreateUpdateContactPayload {
  title: string;
  short_description: string;
  description: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
