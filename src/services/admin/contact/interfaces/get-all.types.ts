import { Timestamp } from "firebase/firestore";

export interface IGetAllContactResponse {
  id: string;
  title: string;
  short_description: string;
  description: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
