import { Timestamp } from "firebase/firestore";

export interface IGetOneContactResponse {
  id: string;
  title: string;
  short_description: string;
  description: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
