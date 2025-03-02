import { Timestamp } from "firebase/firestore";

export interface IGetAllInvestmentResponse {
  id: string;
  title: string;
  description: string;
  whatsapp: string;
  investments: Investment[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Investment {
  name: string;
  type: string;
  image: string;
}
