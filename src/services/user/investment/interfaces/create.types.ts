// import { Timestamp } from "firebase/firestore";

export interface ICreateInvestmentPayload {
  name: string;
  email?: string;
  whatsapp: string;
  location: string;
  //   createdAt?: Timestamp;
}
