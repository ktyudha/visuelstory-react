import { Timestamp } from "firebase/firestore";

export interface IGetAllAboutResponse {
  id: string;
  title: string;
  description: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// export interface About {
//   id: string;
//   title: string;
//   description: string;
//   createdAt?: Timestamp;
//   updatedAt?: Timestamp;
// }
