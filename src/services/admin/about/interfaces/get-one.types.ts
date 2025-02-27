import { Timestamp } from "firebase/firestore";

export interface IGetOneAboutResponse {
  id: string;
  title: string;
  description: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
